import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import cartControllers from "../../controllers/home/cartControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.post("/add-to-cart", cartControllers.add_to_cart);
router.get("/get-product-count", cartControllers.get_product_count);
router.get("/get-cart-products/:customerId", cartControllers.get_cart_products);
// router.get("/get-cart-products/:customerId", cartControllers.get_cart_products_opt);
router.delete(
  "/delete-cart-product/:cartId",
  cartControllers.delete_cart_product
);

router.put("/increase-quantity/:cartId", cartControllers.increase_quantity);
router.put("/decrease-quantity/:cartId", cartControllers.decrease_quantity);

router.post("/add-to-wishlist", cartControllers.add_to_wishlist);
router.get("/get-wishlist-count", cartControllers.get_wishlist_count);
router.get(
  "/get-wishlist-products/:customerId",
  cartControllers.get_wishlist_products
);
router.delete(
  "/remove-wishlist-product/:wishlistId",
  cartControllers.remove_wishlist_product
);

export default router;
