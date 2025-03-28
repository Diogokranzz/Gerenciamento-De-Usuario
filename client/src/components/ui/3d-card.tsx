import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  depth?: number;
}

export function Card3D({ children, className, onClick, depth = 5 }: Card3DProps) {
  return (
    <motion.div
      className={cn(
        "relative bg-white rounded-xl border border-gray-100 overflow-hidden",
        className
      )}
      initial={{ y: 0, rotateX: 0 }}
      whileHover={{ 
        y: -depth, 
        rotateX: 5,
        transition: { duration: 0.3 }
      }}
      style={{ 
        transformStyle: "preserve-3d", 
        perspective: "1000px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export function Card3DHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("p-4 border-b border-gray-200", className)}>
      {children}
    </div>
  );
}

export function Card3DContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  );
}

export function Card3DFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("p-4 border-t border-gray-200", className)}>
      {children}
    </div>
  );
}
