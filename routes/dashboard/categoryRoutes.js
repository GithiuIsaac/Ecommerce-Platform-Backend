import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import categoryControllers from "../../controllers/dashboard/categoryControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.get("/get-category", authMiddleware, categoryControllers.get_category);
router.post("/add-category", authMiddleware, categoryControllers.add_category);
router.put(
  "/update-category/:categoryId",
  authMiddleware,
  categoryControllers.update_category
);

export default router;
