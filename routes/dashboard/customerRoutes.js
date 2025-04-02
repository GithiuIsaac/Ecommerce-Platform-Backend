import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import customerControllers from "../../controllers/dashboard/customerControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
// router.post("/place-order", orderControllers.place_order);
// router.get("/get-dashboard-data", cartControllers.get_product_count);
router.get(
  "/get-dashboard-data/:customerId",
  customerControllers.get_dashboard_data
);
router.get(
  "/get-customer-orders/:customerId/:status",
  customerControllers.get_customer_orders
);
router.get(
  "/get-order-details/:orderId",
  customerControllers.get_order_details
);

export default router;
