import { Router } from "express";
import authControllers from "../controllers/authControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/admin-login", authControllers.admin_login);
router.post("/seller-login", authControllers.seller_login);
router.get("/logout", authMiddleware, authControllers.logout);
router.get("/get-user", authMiddleware, authControllers.get_user);
router.post("/seller-register", authControllers.seller_register);
router.post(
  "/add-profile-image",
  authMiddleware,
  authControllers.add_profile_image
);
router.post(
  "/add-user-profile",
  authMiddleware,
  authControllers.add_user_profile
);
router.post(
  "/change-password",
  authMiddleware,
  authControllers.change_password
);

export default router;
