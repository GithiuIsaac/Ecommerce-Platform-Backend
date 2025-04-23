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
router.post(
  "/update-seller-status",
  authMiddleware,
  sellerControllers.update_seller_status
);
router.get(
  "/get-active-sellers",
  authMiddleware,
  sellerControllers.get_active_sellers
);
router.get(
  "/get-inactive-sellers",
  authMiddleware,
  sellerControllers.get_inactive_sellers
);

export default router;
