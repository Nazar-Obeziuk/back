const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", certificateController.getAllCertificates);
router.get("/:id", certificateController.getCertificate);
router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  upload.array("image_url"),
  certificateController.createCertificate
);
router.put(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  upload.array("image_url"),
  certificateController.updateCertificate
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  certificateController.deleteCertificate
);

module.exports = router;
