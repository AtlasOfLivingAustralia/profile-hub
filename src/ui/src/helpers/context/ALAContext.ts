import { createContext } from "react";

export interface ALAContextProps {
  token?: string;
  userid: string;
  roles: string[];
  isAdmin: boolean;
  isAdminOrEditor: boolean;
  isAuthenticated: boolean;
}

export default createContext<ALAContextProps | null>({
  token: undefined,
  userid: "",
  roles: [],
  isAdmin: false,
  isAdminOrEditor: false,
  isAuthenticated: false,
});
