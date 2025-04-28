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
router.put(
  "/enable-payment-account/:activeCode",
  authMiddleware,
  paymentControllers.enable_payment_account
);
router.get(
  "/seller-payment-details/:sellerId",
  authMiddleware,
  paymentControllers.seller_payment_details
);
router.post(
  "/payment-request",
  authMiddleware,
  paymentControllers.submit_payment_request
);

export default router;
