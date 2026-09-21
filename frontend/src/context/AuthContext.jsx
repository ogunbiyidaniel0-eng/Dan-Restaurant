import { useEffect, useState } from "react";
import { api } from "../services/api";
import { AuthContext } from "./AuthContextDefinition";

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      try {
        const data = await api.getMe();

        if (mounted) {
          setAdmin(data.admin);
        }
      } catch {
        if (mounted) {
          setAdmin(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        setAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}