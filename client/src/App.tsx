import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import UsersPage from "@/pages/users-page";
import UserDetails from "@/pages/user-details";
import GroupsPage from "@/pages/groups-page";
import PermissionsPage from "@/pages/permissions-page";
import ActivitiesPage from "@/pages/activities-page";
import SettingsPage from "@/pages/settings-page";
import ProfilePage from "@/pages/profile-page";
import { AuthProvider } from "@/context/auth-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/users/:id" component={UserDetails} />
      <ProtectedRoute path="/groups" component={GroupsPage} />
      <ProtectedRoute path="/permissions" component={PermissionsPage} />
      <ProtectedRoute path="/activities" component={ActivitiesPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Router />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
