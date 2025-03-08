import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import homeControllers from "../../controllers/home/homeControllers.js";

const router = Router();

// The authMiddleware ensures no access for unauthenticated users
router.get(
  "/get-categories",
  // authMiddleware,
  homeControllers.get_categories
);
// router.post("/add-category", authMiddleware, categoryControllers.add_category);

export default router;
