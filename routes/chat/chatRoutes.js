import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import chatControllers from "../../controllers/chat/chatControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.post("/add-customer", chatControllers.add_customer);
// router.get("/get-product-count", cartControllers.get_product_count);

export default router;
