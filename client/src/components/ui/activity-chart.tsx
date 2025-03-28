import { useEffect, useRef } from "react";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/3d-card";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface ActivityChartProps {
  data: number[];
  labels: string[];
}

export function ActivityChart({ data, labels }: ActivityChartProps) {
  const maxValue = Math.max(...data);
  
  return (
    <Card3D className="h-full">
      <Card3DHeader>
        <h2 className="text-lg font-bold">Atividade de Usuários</h2>
      </Card3DHeader>
      <Card3DContent>
        <div className="chart-container h-[200px] relative mb-4">
          {data.map((value, index) => (
            <motion.div
              key={index}
              className="chart-bar absolute bottom-0 w-[30px] rounded-t-md bg-gradient-to-t from-primary-500 to-blue-400"
              initial={{ height: 0 }}
              animate={{ height: `${(value / maxValue) * 180}px` }}
              transition={{ 
                duration: 1,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15 
              }}
              style={{ 
                left: `${index * (100 / data.length)}%`,
                transform: "translateX(-50%)",
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          {labels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </Card3DContent>
    </Card3D>
  );
}
