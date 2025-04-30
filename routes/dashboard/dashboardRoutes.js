import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import dashboardOrderControllers from "../../controllers/dashboard/dashboardOrderControllers.js";
import dashboardControllers from "../../controllers/dashboard/dashboardControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.get(
  "/admin/home",
  authMiddleware,
  dashboardControllers.get_admin_dashboard
);
router.get(
  "/admin/get-orders",
  authMiddleware,
  dashboardOrderControllers.get_admin_orders
);
router.get(
  "/admin/get-order/:orderId",
  authMiddleware,
  dashboardOrderControllers.get_admin_order
);
router.put(
  "/admin/update-order-status/:orderId",
  authMiddleware,
  dashboardOrderControllers.admin_status_update
);

// Seller Routes
router.get(
  "/seller/home",
  authMiddleware,
  dashboardControllers.get_seller_dashboard
);
router.get(
  "/seller/get-orders/:sellerId",
  authMiddleware,
  dashboardOrderControllers.get_seller_orders
);
router.get(
  "/seller/get-order/:orderId",
  authMiddleware,
  dashboardOrderControllers.get_seller_order
);
router.put(
  "/seller/update-order-status/:orderId",
  authMiddleware,
  dashboardOrderControllers.seller_status_update
);

export default router;
