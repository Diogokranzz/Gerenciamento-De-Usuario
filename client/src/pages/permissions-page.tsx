import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "@/utils/animations";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Shield, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPermissionSchema } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card3D, Card3DContent, Card3DHeader, Card3DFooter } from "@/components/ui/3d-card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Schema for permission form
const permissionFormSchema = z.object({
  name: z.string().min(1, "Nome da permissão é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

export default function PermissionsPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("permissions");

  // Fetch permissions
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery<any[]>({
    queryKey: ["/api/permissions"],
  });

  // Fetch groups
  const { data: groups, isLoading: isLoadingGroups } = useQuery<any[]>({
    queryKey: ["/api/groups"],
  });

  // Filter permissions based on search query
  const filteredPermissions = permissions?.filter(permission => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      permission.name.toLowerCase().includes(searchLower) ||
      permission.description.toLowerCase().includes(searchLower)
    );
  });

  // Create permission form
  const createPermissionForm = useForm<z.infer<typeof permissionFormSchema>>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Edit permission form
  const editPermissionForm = useForm<z.infer<typeof permissionFormSchema>>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof permissionFormSchema>) => {
      const res = await apiRequest("POST", "/api/permissions", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: "Permissão criada",
        description: "Permissão criada com sucesso",
      });
      setIsCreateDialogOpen(false);
      createPermissionForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof permissionFormSchema> }) => {
      const res = await apiRequest("PATCH", `/api/permissions/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: "Permissão atualizada",
        description: "Permissão atualizada com sucesso",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete permission mutation
  const deletePermissionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/permissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: "Permissão excluída",
        description: "Permissão excluída com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add permission to group mutation
  const addPermissionToGroupMutation = useMutation({
    mutationFn: async ({ groupId, permissionId }: { groupId: number; permissionId: number }) => {
      const res = await apiRequest("POST", `/api/groups/${groupId}/permissions`, { permissionId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Permissão adicionada",
        description: "Permissão adicionada ao grupo com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove permission from group mutation
  const removePermissionFromGroupMutation = useMutation({
    mutationFn: async ({ groupId, permissionId }: { groupId: number; permissionId: number }) => {
      await apiRequest("DELETE", `/api/groups/${groupId}/permissions/${permissionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Permissão removida",
        description: "Permissão removida do grupo com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch group permissions
  const { data: groupPermissions, isLoading: isLoadingGroupPermissions } = useQuery<any[]>({
    queryKey: [`/api/groups/${activeTab}/permissions`],
    enabled: activeTab !== "permissions" && groups?.some(g => g.id.toString() === activeTab),
  });

  const onSubmitCreatePermission = (values: z.infer<typeof permissionFormSchema>) => {
    createPermissionMutation.mutate(values);
  };

  const onSubmitEditPermission = (values: z.infer<typeof permissionFormSchema>) => {
    if (currentPermission) {
      updatePermissionMutation.mutate({ id: currentPermission.id, data: values });
    }
  };

  const handleEditPermission = (permission: any) => {
    setCurrentPermission(permission);
    editPermissionForm.reset({
      name: permission.name,
      description: permission.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTogglePermission = (groupId: number, permissionId: number, currentValue: boolean) => {
    if (currentValue) {
      removePermissionFromGroupMutation.mutate({ groupId, permissionId });
    } else {
      addPermissionToGroupMutation.mutate({ groupId, permissionId });
    }
  };

  const hasPermission = (permissionId: number) => {
    return groupPermissions?.some(gp => gp.permissionId === permissionId);
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Permissões</h1>
                <p className="text-gray-600">Gerencie as permissões e os controles de acesso do sistema</p>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Permissão
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Permissão</DialogTitle>
                  </DialogHeader>
                  <Form {...createPermissionForm}>
                    <form onSubmit={createPermissionForm.handleSubmit(onSubmitCreatePermission)} className="space-y-4 mt-2">
                      <FormField
                        control={createPermissionForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Permissão</FormLabel>
                            <FormControl>
                              <Input placeholder="exemplo_permissao" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createPermissionForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Descreva o que esta permissão controla" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createPermissionMutation.isPending}>
                          {createPermissionMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Criar Permissão
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Navbar title="" onSearch={handleSearch} />

            {/* Tabs for Permissions/Groups */}
            <Tabs
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="permissions">Todas as Permissões</TabsTrigger>
                {groups?.map(group => (
                  <TabsTrigger key={group.id} value={group.id.toString()}>
                    {group.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* All Permissions Tab */}
              <TabsContent value="permissions">
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {isLoadingPermissions
                    ? Array(6).fill(0).map((_, index) => (
                        <Skeleton key={index} className="h-48 w-full" />
                      ))
                    : filteredPermissions?.map((permission) => (
                        <Card3D key={permission.id} className="h-full">
                          <Card3DHeader className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Shield className="h-5 w-5 text-primary-500" />
                              <h3 className="text-lg font-bold">{permission.name}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditPermission(permission)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir permissão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. Isso excluirá permanentemente a permissão
                                      "{permission.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deletePermissionMutation.mutate(permission.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {deletePermissionMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : null}
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </Card3DHeader>
                          <Card3DContent>
                            <p className="text-gray-600 text-sm">
                              {permission.description}
                            </p>
                          </Card3DContent>
                        </Card3D>
                      ))
                  }
                </motion.div>

                {filteredPermissions?.length === 0 && !isLoadingPermissions && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Nenhuma permissão encontrada</p>
                  </div>
                )}
              </TabsContent>

              {/* Group Permissions Tabs */}
              {groups?.map(group => (
                <TabsContent key={group.id} value={group.id.toString()}>
                  <Card3D>
                    <Card3DHeader>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: group.color }}
                        />
                        <h3 className="text-lg font-bold">Permissões de {group.name}</h3>
                      </div>
                    </Card3DHeader>
                    <Card3DContent>
                      {isLoadingPermissions || isLoadingGroupPermissions ? (
                        <Skeleton className="h-96 w-full" />
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Permissão</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead className="w-24 text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {permissions?.map(permission => {
                              const isEnabled = hasPermission(permission.id);
                              return (
                                <TableRow key={permission.id}>
                                  <TableCell className="font-medium">{permission.name}</TableCell>
                                  <TableCell>{permission.description}</TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      variant={isEnabled ? "default" : "outline"}
                                      size="sm"
                                      className={isEnabled ? "bg-green-600 hover:bg-green-700" : ""}
                                      onClick={() => handleTogglePermission(group.id, permission.id, isEnabled)}
                                    >
                                      {isEnabled ? (
                                        <Check className="h-4 w-4 mr-1" />
                                      ) : (
                                        <X className="h-4 w-4 mr-1" />
                                      )}
                                      {isEnabled ? "Ativada" : "Desativada"}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </Card3DContent>
                  </Card3D>
                </TabsContent>
              ))}
            </Tabs>

            {/* Edit Permission Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Editar Permissão</DialogTitle>
                </DialogHeader>
                <Form {...editPermissionForm}>
                  <form onSubmit={editPermissionForm.handleSubmit(onSubmitEditPermission)} className="space-y-4 mt-2">
                    <FormField
                      control={editPermissionForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Permissão</FormLabel>
                          <FormControl>
                            <Input placeholder="exemplo_permissao" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editPermissionForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descreva o que esta permissão controla" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={updatePermissionMutation.isPending}>
                        {updatePermissionMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Salvar Alterações
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
