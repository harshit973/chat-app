import express from "express"
import { getUsers } from "../controllers/UserController.js";
import verifyToken from "../middleware/verifyToken.js"

export const userRouter = express.Router();

userRouter.use(verifyToken)
userRouter.get("/",getUsers)
