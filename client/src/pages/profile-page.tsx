import { Sidebar } from "@/components/sidebar";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "@/utils/animations";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Camera, Mail, User, Key, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/3d-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Schema for profile update
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  avatarUrl: z.string().optional(),
});

// Schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Digite sua senha atual"),
  newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirme sua nova senha"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch current user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${user?.id}`],
    enabled: Boolean(user?.id),
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileUpdateSchema>>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      avatarUrl: "",
    },
    values: userData ? {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      avatarUrl: userData.avatarUrl || "",
    } : undefined,
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileUpdateSchema>) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password mutation (simulated, there's no actual API endpoint for this)
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordChangeSchema>) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, you would make a real API call here
      // return await apiRequest("POST", `/api/users/${user?.id}/change-password`, data);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (values: z.infer<typeof profileUpdateSchema>) => {
    updateProfileMutation.mutate(values);
  };

  const onSubmitPassword = (values: z.infer<typeof passwordChangeSchema>) => {
    changePasswordMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <motion.div
            className="page-transition"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
              <p className="text-gray-600">Gerencie suas informações pessoais e configurações de conta</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Profile Card */}
              <motion.div 
                variants={itemVariants} 
                className="lg:col-span-1"
              >
                <Card3D>
                  <Card3DContent className="flex flex-col items-center py-8">
                    <div className="relative">
                      {isLoadingUser ? (
                        <Skeleton className="h-24 w-24 rounded-full" />
                      ) : (
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={userData?.avatarUrl || ""} />
                          <AvatarFallback className="text-2xl">
                            {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full bg-primary-500 h-8 w-8"
                      >
                        <Camera className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                    
                    <h2 className="text-xl font-bold mt-4">
                      {isLoadingUser ? (
                        <Skeleton className="h-6 w-32" />
                      ) : (
                        `${userData?.firstName} ${userData?.lastName}`
                      )}
                    </h2>
                    
                    <p className="text-gray-500 text-sm">
                      {isLoadingUser ? (
                        <Skeleton className="h-4 w-24 mt-1" />
                      ) : (
                        `@${userData?.username}`
                      )}
                    </p>
                    
                    <div className="mt-6 w-full space-y-4">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        {isLoadingUser ? (
                          <Skeleton className="h-4 w-full" />
                        ) : (
                          <span className="text-sm">{userData?.email}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        {isLoadingUser ? (
                          <Skeleton className="h-4 w-32" />
                        ) : (
                          <span className="text-sm">
                            ID: {userData?.id}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card3DContent>
                </Card3D>
              </motion.div>

              {/* Settings Tabs */}
              <motion.div 
                variants={itemVariants} 
                className="lg:col-span-3"
              >
                <Card3D>
                  <Tabs defaultValue="profile">
                    <Card3DHeader>
                      <TabsList>
                        <TabsTrigger value="profile">Informações Pessoais</TabsTrigger>
                        <TabsTrigger value="security">Segurança</TabsTrigger>
                      </TabsList>
                    </Card3DHeader>
                    
                    <Card3DContent>
                      {/* Profile Info Tab */}
                      <TabsContent value="profile">
                        {isLoadingUser ? (
                          <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ) : (
                          <Form {...profileForm}>
                            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={profileForm.control}
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
                                  control={profileForm.control}
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
                                control={profileForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="email"
                                        placeholder="seu.email@exemplo.com" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="avatarUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>URL do Avatar</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="https://exemplo.com/avatar.jpg" 
                                        {...field} 
                                        value={field.value || ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-gray-500">
                                      Coloque a URL de uma imagem para usar como avatar
                                    </p>
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex justify-end">
                                <Button
                                  type="submit"
                                  disabled={updateProfileMutation.isPending}
                                >
                                  {updateProfileMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                  )}
                                  Salvar Alterações
                                </Button>
                              </div>
                            </form>
                          </Form>
                        )}
                      </TabsContent>

                      {/* Security Tab */}
                      <TabsContent value="security">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium">Alterar Senha</h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Atualize sua senha regularmente para manter sua conta segura
                            </p>
                            
                            <Form {...passwordForm}>
                              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                                <FormField
                                  control={passwordForm.control}
                                  name="currentPassword"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Senha Atual</FormLabel>
                                      <div className="relative">
                                        <FormControl>
                                          <Input 
                                            type={showCurrentPassword ? "text" : "password"} 
                                            placeholder="Digite sua senha atual" 
                                            {...field} 
                                          />
                                        </FormControl>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                          {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={passwordForm.control}
                                  name="newPassword"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nova Senha</FormLabel>
                                      <div className="relative">
                                        <FormControl>
                                          <Input 
                                            type={showNewPassword ? "text" : "password"} 
                                            placeholder="Digite sua nova senha" 
                                            {...field} 
                                          />
                                        </FormControl>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                          onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                          {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={passwordForm.control}
                                  name="confirmPassword"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Confirmar Nova Senha</FormLabel>
                                      <div className="relative">
                                        <FormControl>
                                          <Input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            placeholder="Confirme sua nova senha" 
                                            {...field} 
                                          />
                                        </FormControl>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                          {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <div className="flex justify-end">
                                  <Button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                  >
                                    {changePasswordMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <Lock className="h-4 w-4 mr-2" />
                                    )}
                                    Alterar Senha
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium">Sessões Ativas</h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Gerencie os dispositivos onde sua conta está conectada
                            </p>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="flex items-start gap-3">
                                <div className="bg-primary-100 rounded-full p-2">
                                  <Key className="h-5 w-5 text-primary-500" />
                                </div>
                                <div>
                                  <p className="font-medium">Sessão atual</p>
                                  <p className="text-sm text-gray-500">
                                    Navegador: {navigator.userAgent.indexOf("Chrome") > -1 ? "Chrome" : 
                                              navigator.userAgent.indexOf("Firefox") > -1 ? "Firefox" : 
                                              navigator.userAgent.indexOf("Safari") > -1 ? "Safari" : 
                                              "Desconhecido"}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Local: {navigator.language}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Card3DContent>
                  </Tabs>
                </Card3D>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
