import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "@/utils/animations";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/3d-card";
import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all");

  // Fetch activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery<any[]>({
    queryKey: ["/api/activities"],
  });

  // Fetch users for filtering
  const { data: users, isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Filter activities based on search query and user filter
  const filteredActivities = activities?.filter(activity => {
    // Filter by user
    if (userFilter !== "all" && activity.userId.toString() !== userFilter) {
      return false;
    }
    
    // Filter by search query
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      activity.action.toLowerCase().includes(searchLower) ||
      activity.description.toLowerCase().includes(searchLower)
    );
  });

  const getUserById = (userId: number) => {
    return users?.find(user => user.id === userId);
  };

  // Group activities by date
  const groupActivitiesByDate = (activities: any[] = []) => {
    const grouped: Record<string, any[]> = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(activity);
    });
    
    return Object.entries(grouped).map(([date, activities]) => ({
      date,
      formattedDate: format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      activities
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  const groupedActivities = groupActivitiesByDate(filteredActivities);

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
                <h1 className="text-2xl font-bold text-gray-800">Atividades</h1>
                <p className="text-gray-600">Registro de todas as atividades realizadas no sistema</p>
              </div>

              <div className="w-48">
                <Select
                  value={userFilter}
                  onValueChange={setUserFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    {!isLoadingUsers && users?.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Navbar title="" onSearch={handleSearch} />

            {/* Activities Timeline */}
            <div className="space-y-6">
              {isLoadingActivities || isLoadingUsers ? (
                Array(3).fill(0).map((_, groupIndex) => (
                  <div key={groupIndex} className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Card3D>
                      <Card3DContent className="space-y-4">
                        {Array(5).fill(0).map((_, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-3/4 mb-2" />
                              <Skeleton className="h-3 w-1/3" />
                            </div>
                          </div>
                        ))}
                      </Card3DContent>
                    </Card3D>
                  </div>
                ))
              ) : groupedActivities.length === 0 ? (
                <Card3D>
                  <Card3DContent className="py-12 text-center">
                    <p className="text-gray-500">Nenhuma atividade encontrada</p>
                  </Card3DContent>
                </Card3D>
              ) : (
                groupedActivities.map((group) => (
                  <motion.div key={group.date} variants={itemVariants}>
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">{group.formattedDate}</h2>
                    <Card3D>
                      <Card3DContent className="space-y-4">
                        {group.activities.map((activity) => (
                          <ActivityItem
                            key={activity.id}
                            activity={activity}
                            user={getUserById(activity.userId)}
                          />
                        ))}
                      </Card3DContent>
                    </Card3D>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
