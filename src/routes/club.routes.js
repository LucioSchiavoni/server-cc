import { Router } from "express";
import { createClub, updateClubStatus, updateUserClub } from "../controllers/club.controller.js";
import upload, { handleMulterError } from "../middlewares/upload.js";

const router = Router();

router.post("/club", upload.single('image'), handleMulterError, createClub);
router.patch("/club/:id", updateClubStatus);
router.patch("/user/:userId/club", updateUserClub);

export default router; 