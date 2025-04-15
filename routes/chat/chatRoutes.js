import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import chatControllers from "../../controllers/chat/chatControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.post("/link-users", chatControllers.link_users);
router.post("/customer/send-message", chatControllers.send_customer_message);
router.get("/seller/get-customers/:sellerId", chatControllers.get_customers);

export default router;
