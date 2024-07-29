const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", productsController.getProducts);
router.get("/:id", productsController.getProduct);
router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  upload.array("images", 5),
  productsController.createProduct
);
router.put(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  upload.array("images", 5),
  productsController.updateProduct
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  productsController.deleteProduct
);

module.exports = router;
