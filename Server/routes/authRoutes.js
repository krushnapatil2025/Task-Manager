const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

router.post("/upload-image", (req, res) => {
  console.log("Incoming upload request...");
  upload.single("image")(req, res, function (err) {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  });
});

module.exports = router;
