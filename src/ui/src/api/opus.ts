import { request } from "./query";
import type { Collection } from "./types";

export default {
  list: async (): Promise<Collection[]> => request("/list", "GET", null),
};
