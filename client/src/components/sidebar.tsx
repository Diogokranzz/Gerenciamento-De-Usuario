import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  History,
  Settings,
  Lock,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Users2
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "px-4 py-2 flex items-center text-sm font-medium rounded-md mx-2 mb-1 transition-all duration-200 transform hover:translate-x-1",
          active
            ? "text-primary-600 font-medium rounded-md mx-2 mb-1 bg-primary-50"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        <span className={cn("mr-3", active ? "text-primary-500" : "text-gray-400")}>
          {icon}
        </span>
        {label}
      </a>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600 flex items-center">
            <i className="ri-shield-user-line mr-2"></i>
            UserAdmin
          </h1>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={closeMobileMenu} className="md:hidden">
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          )}
        </div>
      </div>

      <div className="py-4 flex-grow">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Principal
        </div>
        <SidebarItem
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          href="/dashboard"
          active={location === "/" || location === "/dashboard"}
        />
        <SidebarItem
          icon={<Users className="h-5 w-5" />}
          label="Usuários"
          href="/users"
          active={location.startsWith("/users")}
        />
        <SidebarItem
          icon={<Users2 className="h-5 w-5" />}
          label="Grupos"
          href="/groups"
          active={location === "/groups"}
        />
        <SidebarItem
          icon={<Lock className="h-5 w-5" />}
          label="Permissões"
          href="/permissions"
          active={location === "/permissions"}
        />
        <SidebarItem
          icon={<History className="h-5 w-5" />}
          label="Atividades"
          href="/activities"
          active={location === "/activities"}
        />

        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Configurações
        </div>
        <SidebarItem
          icon={<Settings className="h-5 w-5" />}
          label="Configurações"
          href="/settings"
          active={location === "/settings"}
        />
        <SidebarItem
          icon={<UserCircle className="h-5 w-5" />}
          label="Meu Perfil"
          href="/profile"
          active={location === "/profile"}
        />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </span>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">
              {user?.groupId === "1" ? "Administrador" : "Usuário"}
            </p>
          </div>
        </div>
        <Button
          className="mt-4 w-full"
          variant="outline"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between md:hidden">
          <h1 className="text-xl font-bold text-primary-600 flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5" />
            UserAdmin
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="bg-white border-r border-gray-200 md:w-64 w-full md:flex flex-col hidden h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
          >
            <motion.div
              className="fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
