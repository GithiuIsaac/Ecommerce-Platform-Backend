import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import dashboardOrderControllers from "../../controllers/dashboard/dashboardOrderControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
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

export default router;
