import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import chatControllers from "../../controllers/chat/chatControllers.js";

const router = Router();

router.post("/link-users", chatControllers.link_users);
router.post("/customer/send-message", chatControllers.send_customer_message);
router.get("/seller/get-customers/:sellerId", chatControllers.get_customers);
// Use authMiddleware to get the req.id
router.get(
  "/seller/get-customer-messages/:customerId",
  authMiddleware,
  chatControllers.get_customer_messages
);
router.post(
  "/seller/send-message",
  authMiddleware,
  chatControllers.send_seller_message
);
router.get("/admin/get-sellers", authMiddleware, chatControllers.get_sellers);
export default router;
