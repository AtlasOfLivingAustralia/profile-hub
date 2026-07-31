import type { PropsWithChildren } from "react";
import { useAuth } from "react-oidc-context";

import ALAContext from "./ALAContext";

const JWT_ROLES = import.meta.env.VITE_AUTH_JWT_ROLES;
const JWT_USERID = import.meta.env.VITE_AUTH_JWT_USERID;
const JWT_ADMIN_ROLE = import.meta.env.VITE_AUTH_JWT_ADMIN_ROLE;
const JWT_EDITOR_ROLE = import.meta.env.VITE_AUTH_JWT_EDITOR_ROLE;

export const ALAProvider = ({ children }: PropsWithChildren) => {
  const auth = useAuth();

  // Extract the user
  const userid = (auth.user?.profile[JWT_USERID] || "") as string;
  const rawRoles = auth.user?.profile[JWT_ROLES] ?? [];
  const roles = (Array.isArray(rawRoles) ? rawRoles : [rawRoles]) as string[];
  const isAdmin = auth.isAuthenticated && roles.includes(JWT_ADMIN_ROLE);
  const isAdminOrEditor =
    auth.isAuthenticated &&
    (isAdmin || (JWT_EDITOR_ROLE ? roles.includes(JWT_EDITOR_ROLE) : false));

  return (
    <ALAContext.Provider
      value={{
        token: auth.isAuthenticated ? auth.user?.access_token : undefined,
        userid,
        roles,
        isAdmin,
        isAdminOrEditor,
        isAuthenticated: auth.isAuthenticated,
      }}
    >
      {children}
    </ALAContext.Provider>
  );
};
