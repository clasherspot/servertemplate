"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeHandler = void 0;
const routeHandler = (app) => {
    app.get("/", (_req, res) => {
        res.json({ message: "Success" });
    });
};
exports.routeHandler = routeHandler;
