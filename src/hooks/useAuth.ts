import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";

/**
 * Hook to access authentication state and methods.
 * Must be used within AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
