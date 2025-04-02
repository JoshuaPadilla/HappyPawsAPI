import express from "express";
import {
  createPetForUser,
  createUserPet,
  deletePet,
  getAllPets,
  getPet,
  getUserPets,
  updatePet,
  updateUserPet,
  deleteUserPet,
  getAllUsersPet,
} from "../controllers/petController.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { restrictToAdmin } from "../middleware/adminRoute.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Protected routes (requires authentication)
router.use(protectRoute);

// User routes
router
  .route("/")
  .post(upload.single("petImage"), createUserPet)
  .get(getUserPets);
router
  .route("/:petId")
  .patch(upload.single("petImage"), updateUserPet)
  .delete(deleteUserPet);

// Admin routes
router.use(restrictToAdmin);
router.get("/all", getAllPets);
router.get("/all/:userID", getAllUsersPet);
router.post("/user/:userId", createPetForUser);
router.route("/:id").get(getPet).patch(updatePet).delete(deletePet);

export default router;
