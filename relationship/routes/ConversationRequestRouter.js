import express from "express";
import { getAllRequests } from "../controller/ChatRequestController.js";

const router = express.Router();

router.get("/", getAllRequests);
export default router;
