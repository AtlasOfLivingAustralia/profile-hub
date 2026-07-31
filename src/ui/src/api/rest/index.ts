import opus from "./opus";

export default (token: string) => ({
	// admin: isAdmin ? admin(token) : null,
	opus: opus(token),
});
