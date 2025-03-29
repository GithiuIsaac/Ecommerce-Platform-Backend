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

export default router;
