const express = require("express");
const router = express.Router();
const individualController = require("../controllers/individualController");
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", individualController.getAllIndividualInsoles);
router.get("/:id", individualController.getIndividualInsole);
router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  upload.array("image_url"),
  individualController.createIndividualInsole
);
router.put(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  upload.array("image_url"),
  individualController.updateIndividualInsole
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  individualController.deleteIndividualInsole
);

module.exports = router;
