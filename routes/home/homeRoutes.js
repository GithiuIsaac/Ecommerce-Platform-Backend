import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import homeControllers from "../../controllers/home/homeControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.get("/get-categories", homeControllers.get_categories);
router.get("/get-products", homeControllers.get_products);
router.get("/price-range-products", homeControllers.price_range_products);
router.get("/query-products", homeControllers.query_products);
router.get("/get-product-details/:slug", homeControllers.get_product_details);
router.post("/customer/submit-review", homeControllers.submit_review);
router.get(
  "/get-product-reviews/:productId",
  homeControllers.get_product_reviews
);

export default router;
