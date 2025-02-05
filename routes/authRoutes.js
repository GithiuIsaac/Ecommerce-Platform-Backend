import { Router } from "express";
import authControllers from "../controllers/authControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// router.get("/", (req, res) => {
//   res.send("Hello World!");
// });

router.post("/admin-login", authControllers.admin_login);
router.get("/get-user", authMiddleware, authControllers.get_user);
router.post("/seller-register", authControllers.seller_register);
export default router;
