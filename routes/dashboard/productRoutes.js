import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import productControllers from "../../controllers/dashboard/productControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.get("/get-products", authMiddleware, productControllers.get_products);
router.get(
  "/get-product/:productId",
  authMiddleware,
  productControllers.get_product
);

router.post("/add-product", authMiddleware, productControllers.add_product);
router.post(
  "/update-product",
  authMiddleware,
  productControllers.update_product
);
router.post(
  "/update-product-image",
  authMiddleware,
  productControllers.update_product_image
);

export default router;
