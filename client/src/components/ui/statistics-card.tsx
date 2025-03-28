import { Card3D } from "@/components/ui/3d-card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: string;
    isPositive: boolean;
  };
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export function StatisticsCard({
  title,
  value,
  icon,
  change,
  iconBgColor = "bg-blue-100",
  iconColor = "text-primary-500",
  className,
}: StatisticsCardProps) {
  return (
    <Card3D className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <motion.h3 
            className="text-2xl font-bold mt-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {value}
          </motion.h3>
          {change && (
            <p className={cn(
              "text-xs font-medium mt-1 flex items-center",
              change.isPositive ? "text-green-500" : "text-red-500"
            )}>
              <i className={cn(
                "mr-1",
                change.isPositive ? "ri-arrow-up-line" : "ri-arrow-down-line"
              )}></i>
              {change.value}
            </p>
          )}
        </div>
        <motion.div 
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            iconBgColor, 
            iconColor
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
      </div>
    </Card3D>
  );
}
