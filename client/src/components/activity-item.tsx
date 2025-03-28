import { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

interface ActivityItemProps {
  activity: Activity;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export function ActivityItem({ activity, user }: ActivityItemProps) {
  // Determine icon and color based on action
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "login":
        return {
          icon: "ri-login-box-line",
          bg: "bg-blue-100",
          color: "text-primary-500"
        };
      case "logout":
        return {
          icon: "ri-logout-box-line",
          bg: "bg-gray-100",
          color: "text-gray-600"
        };
      case "register":
        return {
          icon: "ri-user-add-line",
          bg: "bg-blue-100",
          color: "text-primary-500"
        };
      case "user_update":
        return {
          icon: "ri-edit-line",
          bg: "bg-green-100",
          color: "text-secondary-500"
        };
      case "user_block":
        return {
          icon: "ri-lock-line",
          bg: "bg-red-100",
          color: "text-red-500"
        };
      case "user_unblock":
        return {
          icon: "ri-lock-unlock-line",
          bg: "bg-green-100",
          color: "text-secondary-500"
        };
      case "group_create":
      case "group_update":
      case "group_delete":
        return {
          icon: "ri-group-line",
          bg: "bg-purple-100",
          color: "text-accent-500"
        };
      case "permission_assign":
      case "permission_remove":
        return {
          icon: "ri-shield-line",
          bg: "bg-yellow-100",
          color: "text-yellow-600"
        };
      case "password_recovery":
        return {
          icon: "ri-key-line",
          bg: "bg-amber-100",
          color: "text-amber-600"
        };
      default:
        return {
          icon: "ri-information-line",
          bg: "bg-gray-100",
          color: "text-gray-600"
        };
    }
  };

  const { icon, bg, color } = getActivityIcon(activity.action);
  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { 
    addSuffix: true,
    locale: ptBR 
  });
  
  const userName = user ? `${user.firstName} ${user.lastName}` : `Usuário #${activity.userId}`;

  return (
    <motion.div 
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`mt-1 w-8 h-8 rounded-full ${bg} flex items-center justify-center ${color} flex-shrink-0`}>
        <i className={icon}></i>
      </div>
      <div>
        <p className="text-sm">
          <span className="font-medium">{userName}</span> {activity.description}
        </p>
        <p className="text-xs text-gray-500">{timeAgo}</p>
      </div>
    </motion.div>
  );
}
