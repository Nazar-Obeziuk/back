const express = require("express");
const router = express.Router();
const individualVariationsController = require("../controllers/individualVariationController");
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/:individualId", individualVariationsController.getAllVariations);
router.get("/variation/:id", individualVariationsController.getVariation);


router.post(
  "/:individualId",
  authenticateToken,
  authorizeAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "image_url", maxCount: 10 },
  ]),
  individualVariationsController.createVariation
);
router.put(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "image_url", maxCount: 10 },
  ]),
  individualVariationsController.updateVariation
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  individualVariationsController.deleteVariation
);

module.exports = router;
