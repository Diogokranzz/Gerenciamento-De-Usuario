import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    console.log("Login debug: Comparando senhas");
    console.log("Login debug: Senha fornecida =", supplied);
    console.log("Login debug: Senha armazenada =", stored);
    
    // Tratamento especial para o usuário admin
    if (stored === "senha_admin123") {
      const result = supplied === "admin123";
      console.log("Login debug: Verificação especial para admin, resultado =", result);
      return result;
    }
    
    // Verificação normal de senha com hash
    if (stored.includes('.')) {
      console.log("Login debug: Senha contém ponto, fazendo verificação de hash");
      const [hashed, salt] = stored.split(".");
      
      if (!hashed || !salt) {
        console.error("Formato de senha inválido:", stored);
        return false;
      }
      
      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
      
      const result = timingSafeEqual(hashedBuf, suppliedBuf);
      console.log("Login debug: Resultado da verificação de hash =", result);
      return result;
    }
    
    // Caso a senha armazenada não esteja no formato esperado
    console.error("Formato de senha não reconhecido:", stored);
    return false;
  } catch (error) {
    console.error("Erro ao comparar senhas:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "sistema-gerenciamento-usuario-secreto-2023",
    resave: false,
    saveUninitialized: true, // Alterado para true para persistir sessões
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      secure: false, // Não usar "secure" em desenvolvimento
      httpOnly: true,
      path: "/",
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Credenciais inválidas" });
        }
        
        if (user.isBlocked) {
          return done(null, false, { message: "Conta bloqueada" });
        }
        
        // Update last login
        const now = new Date();
        await storage.updateUser(user.id, { /* lastLogin will be updated in storage */ });
        
        // Log activity
        await storage.createActivity({
          userId: user.id,
          action: "login",
          description: "Usuário fez login no sistema"
        });
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já está em uso" });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(req.body.password);
      const userData = {
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatarUrl: req.body.avatarUrl || null,
        isActive: true,
        isBlocked: false,
        groupId: req.body.groupId,
      };
      
      const user = await storage.createUser(userData);

      // Log activity
      await storage.createActivity({
        userId: user.id,
        action: "register",
        description: "Nova conta criada"
      });

      // Log user in
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message?: string } = {}) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Falha na autenticação" });
      }
      
      req.login(user, (err: Error | null) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    // Log activity if user is authenticated
    if (req.isAuthenticated()) {
      storage.createActivity({
        userId: req.user!.id,
        action: "logout",
        description: "Usuário saiu do sistema"
      });
    }
    
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  
  app.post("/api/recover-password", async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email é obrigatório" });
    }
    
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // In a real system, you would send an email with a reset token
      // Here we'll just simulate the process by logging it
      console.log(`Password reset requested for: ${email}`);
      
      // Log activity
      await storage.createActivity({
        userId: user.id,
        action: "password_recovery",
        description: "Solicitação de recuperação de senha"
      });
      
      res.status(200).json({ message: "Instruções de recuperação enviadas para seu email" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
