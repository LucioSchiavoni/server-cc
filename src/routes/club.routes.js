import { Router } from "express";
import { createClub, getClubById, updateClubStatus, updateUserClub, updateClub } from "../controllers/club.controller.js";
import upload, { handleMulterError } from "../middlewares/upload.js";

const clubRouter = Router();

clubRouter.post("/club", upload.single('image'), handleMulterError, createClub);
clubRouter.patch("/club/:id", updateClubStatus);
clubRouter.patch("/user/:userId/club", updateUserClub);
clubRouter.get("/club/:clubId", getClubById);
clubRouter.put("/club/:id", upload.single('image'), handleMulterError, updateClub);

export default clubRouter; 