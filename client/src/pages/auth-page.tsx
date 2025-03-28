import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, loginSchema } from "@shared/schema";
import { motion } from "framer-motion";
import { pageVariants } from "@/utils/animations";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

export default function AuthPage() {
  const { user, loginMutation, registerMutation, recoverPasswordMutation } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Fetch groups for registration form
  const { data: groups } = useQuery<any[]>({
    queryKey: ["/api/groups"],
    enabled: tab === "register",
  });

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      groupId: "",
    },
  });

  const onSubmitLogin = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onSubmitRegister = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(values);
  };

  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryEmail) {
      recoverPasswordMutation.mutate({ email: recoveryEmail });
      setIsRecoveryOpen(false);
    }
  };

  // Redirect if already logged in
  // Usando useEffect para evitar o erro de render/setState
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <Card className="w-full max-w-4xl overflow-hidden">
        <div className="grid md:grid-cols-2 grid-cols-1">
          {/* Login/Register Form Column */}
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center md:justify-start">
                <i className="ri-shield-user-line mr-2 text-primary-600"></i>
                UserAdmin
              </h1>
              <p className="text-gray-600">
                Sistema completo de gerenciamento de usuários
              </p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome de usuário" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Sua senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="text-right">
                      <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
                        <DialogTrigger asChild>
                          <Button variant="link" className="text-sm text-primary-600 p-0">
                            Esqueceu sua senha?
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Recuperação de senha</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleRecoverPassword} className="space-y-4 mt-2">
                            <div>
                              <FormLabel>Email</FormLabel>
                              <Input
                                type="email"
                                placeholder="Seu email de cadastro"
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full">
                              {recoverPasswordMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Enviar instruções
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Entrar
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sobrenome</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu sobrenome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu.email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Escolha um nome de usuário" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Crie uma senha" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirme sua senha" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="groupId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grupo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um grupo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {groups?.map((group) => (
                                <SelectItem key={group.id} value={group.id.toString()}>
                                  {group.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Cadastrar
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>

          {/* Hero Section Column */}
          <div className="hidden md:flex flex-col bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4">Bem-vindo ao UserAdmin</h2>
              <p className="mb-6 text-primary-100">
                Sistema completo para gerenciamento de usuários e permissões com interface 3D e animações interativas.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-500 bg-opacity-20 rounded-full p-2 mr-3">
                    <i className="ri-user-settings-line text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Gerenciamento completo</h3>
                    <p className="text-sm text-primary-100">
                      Cadastre, edite, bloqueie e gerencie usuários com facilidade
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-500 bg-opacity-20 rounded-full p-2 mr-3">
                    <i className="ri-shield-check-line text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Segurança avançada</h3>
                    <p className="text-sm text-primary-100">
                      Controle granular de permissões e grupos de usuários
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-500 bg-opacity-20 rounded-full p-2 mr-3">
                    <i className="ri-3d-cube-line text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Interface moderna</h3>
                    <p className="text-sm text-primary-100">
                      Design responsivo com elementos 3D e animações fluidas
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
