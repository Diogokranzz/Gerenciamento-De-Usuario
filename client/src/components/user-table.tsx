import { User, Group } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Pencil, Eye, Lock, Unlock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserTableProps {
  users: User[];
  groups: Group[];
  onBlockUser?: (id: number) => void;
  onUnblockUser?: (id: number) => void;
  onDeleteUser?: (id: number) => void;
}

export function UserTable({ 
  users, 
  groups,
  onBlockUser,
  onUnblockUser,
  onDeleteUser
}: UserTableProps) {
  const [, navigate] = useLocation();

  const getGroupById = (groupId: string) => {
    const id = parseInt(groupId);
    return groups.find(group => group.id === id);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Usuários</h2>
      </div>
      
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</TableHead>
            <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>
            <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</TableHead>
            <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200">
          {users.map((user, index) => {
            const group = getGroupById(user.groupId);
            
            return (
              <TableRow 
                key={user.id}
                className="hover:bg-gray-50 transition duration-200"
                as={motion.tr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TableCell className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img 
                          className="h-8 w-8 rounded-full object-cover" 
                          src={user.avatarUrl} 
                          alt={`${user.firstName} ${user.lastName}`} 
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </TableCell>
                <TableCell className="py-4 px-4 whitespace-nowrap">
                  <span 
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{ 
                      backgroundColor: group ? `${group.color}20` : '#E5E7EB',
                      color: group ? group.color : '#6B7280'
                    }}
                  >
                    {group?.name || 'Sem grupo'}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4 whitespace-nowrap">
                  {user.isBlocked ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Bloqueado
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Ativo
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate(`/users/${user.id}`)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate(`/users/${user.id}`)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                    {user.isBlocked ? (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onUnblockUser?.(user.id)}
                        title="Desbloquear"
                      >
                        <Unlock className="h-4 w-4 text-green-600" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onBlockUser?.(user.id)}
                        title="Bloquear"
                      >
                        <Lock className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => onDeleteUser?.(user.id)}
                      title="Excluir"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum usuário encontrado</p>
        </div>
      )}
    </div>
  );
}
