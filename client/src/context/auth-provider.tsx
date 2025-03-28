import { ReactNode } from "react";
import { AuthProvider as BaseAuthProvider } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <BaseAuthProvider>{children}</BaseAuthProvider>;
}
