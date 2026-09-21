import { useContext } from "react";
import { AuthContext } from "./AuthContextDefinition";

export function useAuth() {
  return useContext(AuthContext);
}