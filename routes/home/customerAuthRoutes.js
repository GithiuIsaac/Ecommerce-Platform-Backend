import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import customerAuthControllers from "../../controllers/home/customerAuthControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.post("/customer-register", customerAuthControllers.customer_register);
router.post("/customer-login", customerAuthControllers.customer_login);
// router.get("/price-range-products", customerAuthControllers.price_range_products);
// router.get("/query-products", customerAuthControllers.query_products);
// router.post("/add-category", authMiddleware, categoryControllers.add_category);

export default router;
