import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import orderControllers from "../../controllers/order/orderControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.post("/place-order", orderControllers.place_order);
router.post("/create-payment", orderControllers.create_payment);
// router.get("/get-product-count", cartControllers.get_product_count);

export default router;
