import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import cartControllers from "../../controllers/home/cartControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.post("/add-to-cart", cartControllers.add_to_cart);
router.get("/get-product-count", cartControllers.get_product_count);
router.get("/get-cart-products/:customerId", cartControllers.get_cart_products);
// router.get("/get-cart-products/:customerId", cartControllers.get_cart_products_opt);
// router.get("/price-range-products", homeControllers.price_range_products);
// router.get("/query-products", homeControllers.query_products);
// router.post("/add-category", authMiddleware, categoryControllers.add_category);

export default router;
