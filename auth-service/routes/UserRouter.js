import express from "express"
import { getStatus, getUsers, updateStatus } from "../controllers/UserController.js";
import verifyToken from "../middleware/verifyToken.js";

export const userRouter = express.Router();

userRouter.patch("/:authName/status",updateStatus)
userRouter.post("/status",getStatus)
// userRouter.use(verifyToken)
userRouter.get("/",getUsers)
