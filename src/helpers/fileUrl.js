import { api } from "../config";

// Older uploads are saved as paths on the API; new ones are full R2 addresses.
export const resolveFileUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : new URL(path, api.API_URL).href;
};
