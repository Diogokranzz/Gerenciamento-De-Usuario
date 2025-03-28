import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "@/utils/animations";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Users } from "lucide-react";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGroupSchema } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/3d-card";
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

// Schema for group form
const groupFormSchema = z.object({
  name: z.string().min(1, "Nome do grupo é obrigatório"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
});

export default function GroupsPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentGroup, setCurrentGroup] = useState<any>(null);

  // Fetch groups
  const { data: groups, isLoading: isLoadingGroups } = useQuery<any[]>({
    queryKey: ["/api/groups"],
  });

  // Filter groups based on search query
  const filteredGroups = groups?.filter(group => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      (group.description && group.description.toLowerCase().includes(searchLower))
    );
  });

  // Create group form
  const createGroupForm = useForm<z.infer<typeof groupFormSchema>>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6", // Default blue color
    },
  });

  // Edit group form
  const editGroupForm = useForm<z.infer<typeof groupFormSchema>>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
    },
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof groupFormSchema>) => {
      const res = await apiRequest("POST", "/api/groups", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Grupo criado",
        description: "Grupo criado com sucesso",
      });
      setIsCreateDialogOpen(false);
      createGroupForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof groupFormSchema> }) => {
      const res = await apiRequest("PATCH", `/api/groups/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Grupo atualizado",
        description: "Grupo atualizado com sucesso",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Grupo excluído",
        description: "Grupo excluído com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitCreateGroup = (values: z.infer<typeof groupFormSchema>) => {
    createGroupMutation.mutate(values);
  };

  const onSubmitEditGroup = (values: z.infer<typeof groupFormSchema>) => {
    if (currentGroup) {
      updateGroupMutation.mutate({ id: currentGroup.id, data: values });
    }
  };

  const handleEditGroup = (group: any) => {
    setCurrentGroup(group);
    editGroupForm.reset({
      name: group.name,
      description: group.description || "",
      color: group.color,
    });
    setIsEditDialogOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
                <h1 className="text-2xl font-bold text-gray-800">Grupos</h1>
                <p className="text-gray-600">Gerencie os grupos de usuários do sistema</p>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Grupo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Grupo</DialogTitle>
                  </DialogHeader>
                  <Form {...createGroupForm}>
                    <form onSubmit={createGroupForm.handleSubmit(onSubmitCreateGroup)} className="space-y-4 mt-2">
                      <FormField
                        control={createGroupForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Grupo</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do grupo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createGroupForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Input placeholder="Descrição do grupo" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createGroupForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor</FormLabel>
                            <div className="flex items-center gap-2">
                              <Input type="color" {...field} className="w-12 h-10 p-1" />
                              <Input 
                                placeholder="#3B82F6" 
                                {...field} 
                                className="flex-1"
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </div>
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
                        <Button type="submit" disabled={createGroupMutation.isPending}>
                          {createGroupMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Criar Grupo
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Navbar title="" onSearch={handleSearch} />

            {/* Groups grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingGroups
                ? Array(6).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-48 w-full" />
                  ))
                : filteredGroups?.map((group) => (
                    <motion.div key={group.id} variants={itemVariants}>
                      <Card3D className="h-full">
                        <Card3DHeader className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: group.color }}
                            />
                            <h3 className="text-lg font-bold">{group.name}</h3>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditGroup(group)}
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
                                  <AlertDialogTitle>Excluir grupo</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o grupo
                                    "{group.name}". Grupos que contêm usuários não podem ser excluídos.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteGroupMutation.mutate(group.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {deleteGroupMutation.isPending ? (
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
                          <p className="text-gray-600 text-sm mb-4">
                            {group.description || "Sem descrição"}
                          </p>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Users className="h-4 w-4 mr-1" />
                            <span>Usuários: 0</span>
                          </div>
                        </Card3DContent>
                      </Card3D>
                    </motion.div>
                  ))
              }
            </div>

            {filteredGroups?.length === 0 && !isLoadingGroups && (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum grupo encontrado</p>
              </div>
            )}

            {/* Edit Group Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Editar Grupo</DialogTitle>
                </DialogHeader>
                <Form {...editGroupForm}>
                  <form onSubmit={editGroupForm.handleSubmit(onSubmitEditGroup)} className="space-y-4 mt-2">
                    <FormField
                      control={editGroupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Grupo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do grupo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editGroupForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Descrição do grupo" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editGroupForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor</FormLabel>
                          <div className="flex items-center gap-2">
                            <Input type="color" {...field} className="w-12 h-10 p-1" />
                            <Input 
                              placeholder="#3B82F6" 
                              {...field} 
                              className="flex-1"
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </div>
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
                      <Button type="submit" disabled={updateGroupMutation.isPending}>
                        {updateGroupMutation.isPending ? (
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
