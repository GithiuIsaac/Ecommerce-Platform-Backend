import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import sellerControllers from "../../controllers/dashboard/sellerControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.get(
  "/get-seller-requests",
  authMiddleware,
  sellerControllers.get_seller_requests
);
router.get(
  "/get-seller/:sellerId",
  authMiddleware,
  sellerControllers.get_seller
);

export default router;
