import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "@/utils/animations";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, Trash2, Lock, Unlock } from "lucide-react";
import { useParams, useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/3d-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ActivityItem } from "@/components/activity-item";

// Schema for user editing
const userEditSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  groupId: z.string().min(1, "Grupo é obrigatório"),
  avatarUrl: z.string().optional(),
});

export default function UserDetails() {
  const { id } = useParams();
  const userId = parseInt(id);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Fetch user details
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: Boolean(userId),
  });

  // Fetch groups
  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["/api/groups"],
  });

  // Fetch user activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: [`/api/activities?userId=${userId}`],
    enabled: Boolean(userId) && activeTab === "activities",
  });

  // Form setup
  const form = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      groupId: "",
      avatarUrl: "",
    },
    values: user ? {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      groupId: user.groupId,
      avatarUrl: user.avatarUrl || "",
    } : undefined,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userEditSchema>) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/users/${userId}/block`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário bloqueado",
        description: "O usuário foi bloqueado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao bloquear usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Unblock user mutation
  const unblockUserMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/users/${userId}/unblock`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário desbloqueado",
        description: "O usuário foi desbloqueado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao desbloquear usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso",
      });
      navigate("/users");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = (values: z.infer<typeof userEditSchema>) => {
    updateUserMutation.mutate(values);
  };

  // Find group by ID
  const getGroupById = (groupId: string) => {
    return groups?.find(g => g.id.toString() === groupId);
  };

  // Get formatted last login
  const getLastLogin = () => {
    if (!user || !user.lastLogin) return "Nunca";
    return formatDistanceToNow(new Date(user.lastLogin), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  // Get formatted creation date
  const getCreationDate = () => {
    if (!user || !user.createdAt) return "Desconhecido";
    return formatDistanceToNow(new Date(user.createdAt), { 
      addSuffix: true, 
      locale: ptBR 
    });
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
            {/* Header */}
            <div className="flex items-center mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/users")}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {isLoadingUser ? (
                    <Skeleton className="h-8 w-40" />
                  ) : (
                    `${user?.firstName} ${user?.lastName}`
                  )}
                </h1>
                <p className="text-gray-600">
                  {isLoadingUser ? (
                    <Skeleton className="h-4 w-24 mt-1" />
                  ) : (
                    user?.groupId ? getGroupById(user.groupId)?.name : "Sem grupo"
                  )}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Avatar and info */}
              <motion.div variants={itemVariants}>
                <Card3D className="mb-6">
                  <Card3DContent className="flex flex-col items-center py-8">
                    {isLoadingUser ? (
                      <Skeleton className="h-24 w-24 rounded-full" />
                    ) : (
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.avatarUrl || ""} />
                        <AvatarFallback className="text-2xl">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <h2 className="text-xl font-bold mt-4">
                      {isLoadingUser ? (
                        <Skeleton className="h-6 w-32" />
                      ) : (
                        `${user?.firstName} ${user?.lastName}`
                      )}
                    </h2>
                    
                    <p className="text-gray-500 text-sm">
                      {isLoadingUser ? (
                        <Skeleton className="h-4 w-24 mt-1" />
                      ) : (
                        `@${user?.username}`
                      )}
                    </p>
                    
                    <div className="mt-4">
                      {isLoadingUser ? (
                        <Skeleton className="h-8 w-24" />
                      ) : user?.isBlocked ? (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Bloqueado
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      )}
                    </div>
                  </Card3DContent>
                </Card3D>

                {/* User info */}
                <Card3D>
                  <Card3DHeader>
                    <h3 className="text-lg font-medium">Informações</h3>
                  </Card3DHeader>
                  <Card3DContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      {isLoadingUser ? (
                        <Skeleton className="h-5 w-full mt-1" />
                      ) : (
                        <p className="text-sm font-medium">{user?.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Grupo</p>
                      {isLoadingUser || isLoadingGroups ? (
                        <Skeleton className="h-5 w-32 mt-1" />
                      ) : (
                        <p className="text-sm font-medium">
                          {user?.groupId ? getGroupById(user.groupId)?.name : "Sem grupo"}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Último login</p>
                      {isLoadingUser ? (
                        <Skeleton className="h-5 w-40 mt-1" />
                      ) : (
                        <p className="text-sm font-medium">{getLastLogin()}</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Conta criada</p>
                      {isLoadingUser ? (
                        <Skeleton className="h-5 w-40 mt-1" />
                      ) : (
                        <p className="text-sm font-medium">{getCreationDate()}</p>
                      )}
                    </div>
                  </Card3DContent>
                </Card3D>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  {isLoadingUser ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : user?.isBlocked ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => unblockUserMutation.mutate()}
                      disabled={unblockUserMutation.isPending}
                    >
                      {unblockUserMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Unlock className="h-4 w-4 mr-2" />
                      )}
                      Desbloquear Usuário
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => blockUserMutation.mutate()}
                      disabled={blockUserMutation.isPending}
                    >
                      {blockUserMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      Bloquear Usuário
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Usuário
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário
                          e todas as suas informações associadas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteUserMutation.mutate()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteUserMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>

              {/* Right column - Tabs for editing and activities */}
              <motion.div className="lg:col-span-2" variants={itemVariants}>
                <Card3D>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <Card3DHeader>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Perfil</TabsTrigger>
                        <TabsTrigger value="activities">Atividades</TabsTrigger>
                      </TabsList>
                    </Card3DHeader>
                    
                    <Card3DContent>
                      {/* Edit Profile Tab */}
                      <TabsContent value="profile">
                        {isLoadingUser || isLoadingGroups ? (
                          <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ) : (
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="firstName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nome</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Nome" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="lastName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Sobrenome</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Sobrenome" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input placeholder="email@exemplo.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome de usuário</FormLabel>
                                    <FormControl>
                                      <Input placeholder="nome_usuario" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="groupId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Grupo</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                              
                              <FormField
                                control={form.control}
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
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex justify-end">
                                <Button
                                  type="submit"
                                  disabled={updateUserMutation.isPending}
                                >
                                  {updateUserMutation.isPending ? (
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

                      {/* Activities Tab */}
                      <TabsContent value="activities">
                        {isLoadingActivities ? (
                          <div className="space-y-4">
                            {Array(5).fill(0).map((_, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1">
                                  <Skeleton className="h-4 w-3/4 mb-2" />
                                  <Skeleton className="h-3 w-1/3" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : activities?.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Nenhuma atividade encontrada</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {activities?.map((activity) => (
                              <ActivityItem 
                                key={activity.id} 
                                activity={activity}
                                user={user}
                              />
                            ))}
                          </div>
                        )}
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
