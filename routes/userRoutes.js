import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getAllUser,
  getUser,
  updateUser,
  updateUserByAdmin,
} from "../controllers/userController.js";
import { restrictToAdmin } from "../middleware/adminRoute.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Protected route that handles both file upload and user update
// uploadProfilePicture middleware will handle the file upload to S3
// updateUser will handle updating the user data including the S3 file URL

router.use(protectRoute);
router.patch(
  "/",
  upload.single("profilePicture"), // Handle single file upload with field name 'profilePicture'
  updateUser
);

// admin route
router.use(restrictToAdmin);
router.get("/", getAllUser);
router
  .route("/:userID")
  .get(getUser)
  .patch(upload.single("profilePicture"), updateUserByAdmin);

export default router;
