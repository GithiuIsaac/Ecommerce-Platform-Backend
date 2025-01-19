import { Router } from "express";
import authControllers from "../controllers/authControllers.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/admin-login", authControllers.admin_login);

export default router;
