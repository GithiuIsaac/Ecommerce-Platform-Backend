import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import chatControllers from "../../controllers/chat/chatControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.post("/link-users", chatControllers.link_users);
// router.get("/get-product-count", cartControllers.get_product_count);

export default router;
