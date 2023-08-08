import { Express } from "express";
export const routeHandler = (app: Express) => {
  app.get("/", (_req, res) => {
    res.json({ message: "Success" });
  });
};
