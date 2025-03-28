import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface NavbarProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
}

export function Navbar({ title, subtitle, onSearch }: NavbarProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNotification, setHasNotification] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const clearNotification = () => {
    setHasNotification(false);
  };

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && (
          <p className="text-gray-600">
            {subtitle.replace("{name}", user?.firstName || "")}
          </p>
        )}
      </motion.div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar..."
            className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="p-2 bg-white rounded-full border border-gray-300 hover:bg-gray-50 transition duration-300 relative"
            onClick={clearNotification}
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {hasNotification && (
              <motion.span
                className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 10 
                }}
              />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
