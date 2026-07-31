import { request } from "./query";

export default (token: string) => ({
	list: async (): Promise<void> =>
		request(`${import.meta.env.VITE_API_OPUS}/list`, "GET", null, token),
});
