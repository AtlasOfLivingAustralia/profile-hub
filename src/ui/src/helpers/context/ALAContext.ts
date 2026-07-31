import { createContext } from "react";

// APIs
import { rest } from "#/api";

export interface ALAContextProps {
	token?: string;
	userid: string;
	roles: string[];
	rest: ReturnType<typeof rest>;
	isAdmin: boolean;
	isAdminOrEditor: boolean;
	isAuthenticated: boolean;
}

export default createContext<ALAContextProps | null>({
	token: undefined,
	userid: "",
	roles: [],
	rest: rest(""),
	isAdmin: false,
	isAdminOrEditor: false,
	isAuthenticated: false,
});
