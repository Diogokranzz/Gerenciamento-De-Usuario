import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertUserSchema, insertGroupSchema, 
  insertPermissionSchema, insertActivitySchema 
} from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Não autenticado" });
};

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  
  const user = req.user!;
  if (user.groupId === "1") { // Admin group
    return next();
  }
  
  res.status(403).json({ message: "Permissão negada" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  // if you call this function, make sure to also create auth.ts
  setupAuth(app);

  // put application routes here
  // prefix all routes with /api

  // User routes
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.user!;
      
      // Check if user is updating their own profile or is an admin
      if (currentUser.id !== userId && currentUser.groupId !== "1") {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      // Extract allowed fields for update
      const { firstName, lastName, email, avatarUrl, isActive, groupId } = req.body;
      const updateData: any = {};
      
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
      
      // Only admins can update these fields
      if (currentUser.groupId === "1") {
        if (isActive !== undefined) updateData.isActive = isActive;
        if (groupId !== undefined) updateData.groupId = groupId;
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Log activity
      await storage.createActivity({
        userId: currentUser.id,
        action: "user_update",
        description: `Usuário ${updatedUser.id} foi atualizado`
      });
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/users/:id/block", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.user!;
      
      // Prevent self-block
      if (currentUser.id === userId) {
        return res.status(400).json({ message: "Não é possível bloquear sua própria conta" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const blockedUser = await storage.blockUser(userId);
      
      // Log activity
      await storage.createActivity({
        userId: currentUser.id,
        action: "user_block",
        description: `Usuário ${userId} foi bloqueado`
      });
      
      res.json(blockedUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/users/:id/unblock", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const unblockedUser = await storage.unblockUser(userId);
      
      // Log activity
      await storage.createActivity({
        userId: req.user!.id,
        action: "user_unblock",
        description: `Usuário ${userId} foi desbloqueado`
      });
      
      res.json(unblockedUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.user!;
      
      // Prevent self-delete
      if (currentUser.id === userId) {
        return res.status(400).json({ message: "Não é possível excluir sua própria conta" });
      }
      
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: currentUser.id,
        action: "user_delete",
        description: `Usuário ${userId} foi excluído`
      });
      
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Group routes
  app.get("/api/groups", isAuthenticated, async (req, res) => {
    try {
      const groups = await storage.getAllGroups();
      res.json(groups);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/groups/:id", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Grupo não encontrado" });
      }
      
      res.json(group);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/groups", isAdmin, async (req, res) => {
    try {
      // Validate request body
      const groupData = insertGroupSchema.parse(req.body);
      
      // Check if group name already exists
      const existingGroup = await storage.getGroupByName(groupData.name);
      if (existingGroup) {
        return res.status(400).json({ message: "Nome do grupo já existe" });
      }
      
      const group = await storage.createGroup(groupData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user!.id,
        action: "group_create",
        description: `Grupo ${group.name} foi criado`
      });
      
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Erro desconhecido" });
    }
  });
  
  app.patch("/api/groups/:id", isAdmin, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      
      // Get allowed fields for update
      const { name, description, color } = req.body;
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (color !== undefined) updateData.color = color;
      
      const updatedGroup = await storage.updateGroup(groupId, updateData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user!.id,
        action: "group_update",
        description: `Grupo ${updatedGroup.name} foi atualizado`
      });
      
      res.json(updatedGroup);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/groups/:id", isAdmin, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      
      // Don't allow deleting admin group
      if (groupId === 1) {
        return res.status(400).json({ message: "Não é possível excluir o grupo de administração" });
      }
      
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo não encontrado" });
      }
      
      // Check if there are users in this group
      const users = await storage.getAllUsers();
      const usersInGroup = users.filter(user => parseInt(user.groupId) === groupId);
      
      if (usersInGroup.length > 0) {
        return res.status(400).json({ 
          message: "Não é possível excluir grupo que contém usuários", 
          count: usersInGroup.length 
        });
      }
      
      const deleted = await storage.deleteGroup(groupId);
      
      // Log activity
      await storage.createActivity({
        userId: req.user!.id,
        action: "group_delete",
        description: `Grupo ${group.name} foi excluído`
      });
      
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Permission routes
  app.get("/api/permissions", isAuthenticated, async (req, res) => {
    try {
      const permissions = await storage.getAllPermissions();
      res.json(permissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/groups/:id/permissions", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const groupPermissions = await storage.getGroupPermissions(groupId);
      res.json(groupPermissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/groups/:id/permissions", isAdmin, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const { permissionId } = req.body;
      
      if (!permissionId) {
        return res.status(400).json({ message: "ID da permissão é obrigatório" });
      }
      
      // Check if permission exists
      const permission = await storage.getPermission(permissionId);
      if (!permission) {
        return res.status(404).json({ message: "Permissão não encontrada" });
      }
      
      // Check if group exists
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo não encontrado" });
      }
      
      const groupPermission = await storage.addPermissionToGroup(groupId, permissionId);
      
      // Log activity
      await storage.createActivity({
        userId: req.user!.id,
        action: "permission_assign",
        description: `Permissão ${permission.name} adicionada ao grupo ${group.name}`
      });
      
      res.status(201).json(groupPermission);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/groups/:groupId/permissions/:permissionId", isAdmin, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const permissionId = parseInt(req.params.permissionId);
      
      // Check if group exists
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo não encontrado" });
      }
      
      // Check if permission exists
      const permission = await storage.getPermission(permissionId);
      if (!permission) {
        return res.status(404).json({ message: "Permissão não encontrada" });
      }
      
      const removed = await storage.removePermissionFromGroup(groupId, permissionId);
      
      if (!removed) {
        return res.status(404).json({ message: "Permissão não encontrada no grupo" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: req.user!.id,
        action: "permission_remove",
        description: `Permissão ${permission.name} removida do grupo ${group.name}`
      });
      
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Activity routes
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      // If user is not admin and trying to see activities other than their own
      if (req.user!.groupId !== "1" && userId && userId !== req.user!.id) {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const activities = await storage.getActivities(userId);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/activities", isAuthenticated, async (req, res) => {
    try {
      // Validate request body
      const activityData = insertActivitySchema.parse(req.body);
      
      // Only admins can create activities for other users
      if (req.user!.groupId !== "1" && activityData.userId !== req.user!.id) {
        return res.status(403).json({ message: "Permissão negada" });
      }
      
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Erro desconhecido" });
    }
  });
  
  // Dashboard statistics
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const groups = await storage.getAllGroups();
      const activities = await storage.getActivities();
      
      // Calculate statistics
      const totalUsers = users.length;
      const activeGroups = groups.length;
      
      // Calculate new registrations in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newRegistrations = users.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= thirtyDaysAgo;
      }).length;
      
      // Calculate blocked accounts
      const blockedAccounts = users.filter(user => user.isBlocked).length;
      
      // Calculate activity by day of week
      const activityByDay = Array(7).fill(0);
      activities.forEach(activity => {
        const date = new Date(activity.timestamp);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        activityByDay[dayOfWeek]++;
      });
      
      // Get recent activities (last 20)
      const recentActivities = activities.slice(0, 20);
      
      res.json({
        totalUsers,
        activeGroups,
        newRegistrations,
        blockedAccounts,
        activityByDay,
        recentActivities
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
