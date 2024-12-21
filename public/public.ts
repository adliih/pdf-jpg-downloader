import { api } from "encore.dev/api";

export const get = api.static({
  path: "/!path",
  expose: true,
  dir: "./files",
});
