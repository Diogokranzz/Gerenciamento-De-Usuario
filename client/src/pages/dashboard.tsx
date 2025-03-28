import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { StatisticsCard } from "@/components/ui/statistics-card";
import { ActivityChart } from "@/components/ui/activity-chart";
import { Card3D, Card3DHeader, Card3DContent } from "@/components/ui/3d-card";
import { ActivityItem } from "@/components/activity-item";
import { UserTable } from "@/components/user-table";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "@/utils/animations";
import {
  User, Users, UserPlus, Lock, BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  // Fetch groups
  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["/api/groups"],
  });

  // Map of weekday indexes to labels
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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
            <Navbar
              title="Dashboard"
              subtitle="Bem-vindo, {name}. Aqui está o resumo do sistema."
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isLoadingStats ? (
                Array(4).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-36 w-full" />
                ))
              ) : (
                <>
                  <motion.div variants={itemVariants}>
                    <StatisticsCard
                      title="Usuários Totais"
                      value={stats?.totalUsers || 0}
                      icon={<User className="text-xl" />}
                      change={{
                        value: "12% este mês",
                        isPositive: true,
                      }}
                      iconBgColor="bg-blue-100"
                      iconColor="text-primary-500"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <StatisticsCard
                      title="Grupos Ativos"
                      value={stats?.activeGroups || 0}
                      icon={<Users className="text-xl" />}
                      change={{
                        value: "8% este mês",
                        isPositive: true,
                      }}
                      iconBgColor="bg-purple-100"
                      iconColor="text-accent-500"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <StatisticsCard
                      title="Novos Registros"
                      value={stats?.newRegistrations || 0}
                      icon={<UserPlus className="text-xl" />}
                      change={{
                        value: "24% este mês",
                        isPositive: true,
                      }}
                      iconBgColor="bg-green-100"
                      iconColor="text-secondary-500"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <StatisticsCard
                      title="Contas Bloqueadas"
                      value={stats?.blockedAccounts || 0}
                      icon={<Lock className="text-xl" />}
                      change={{
                        value: "3% este mês",
                        isPositive: false,
                      }}
                      iconBgColor="bg-red-100"
                      iconColor="text-red-500"
                    />
                  </motion.div>
                </>
              )}
            </div>

            {/* Chart and Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <motion.div className="lg:col-span-2" variants={itemVariants}>
                {isLoadingStats ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ActivityChart
                    data={stats?.activityByDay || [0, 0, 0, 0, 0, 0, 0]}
                    labels={weekdays}
                  />
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card3D className="h-full">
                  <Card3DHeader>
                    <h2 className="text-lg font-bold">Atividades Recentes</h2>
                  </Card3DHeader>
                  <Card3DContent>
                    {isLoadingStats ? (
                      Array(4).fill(0).map((_, index) => (
                        <div key={index} className="flex items-start gap-3 mb-4">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-4">
                        {stats?.recentActivities?.slice(0, 4).map((activity: any) => (
                          <ActivityItem
                            key={activity.id}
                            activity={activity}
                            user={users?.find((u: any) => u.id === activity.userId)}
                          />
                        ))}

                        <Button
                          variant="link"
                          className="w-full py-2 text-sm text-primary-600 font-medium hover:text-primary-700 transition duration-300"
                          onClick={() => navigate("/activities")}
                        >
                          Ver todas as atividades
                        </Button>
                      </div>
                    )}
                  </Card3DContent>
                </Card3D>
              </motion.div>
            </div>

            {/* Users Table */}
            <motion.div variants={itemVariants}>
              {isLoadingUsers || isLoadingGroups ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <UserTable
                  users={users?.slice(0, 4) || []}
                  groups={groups || []}
                  onBlockUser={(id) => navigate(`/users/${id}`)}
                  onUnblockUser={(id) => navigate(`/users/${id}`)}
                  onDeleteUser={(id) => navigate(`/users/${id}`)}
                />
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
