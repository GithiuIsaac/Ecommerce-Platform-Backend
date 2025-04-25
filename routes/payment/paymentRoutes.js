import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import paymentControllers from "../../controllers/payment/paymentControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.get(
  "/connect-payment-account",
  authMiddleware,
  paymentControllers.connect_payment_account
);

// router.post(
//   "/update-seller-status",
//   authMiddleware,
//   sellerControllers.update_seller_status
// );

export default router;
