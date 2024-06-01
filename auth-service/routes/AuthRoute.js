import express from "express"
import { decodeJwt, signin, signup } from "../controllers/AuthController.js";
import verifyToken from "../middleware/verifyToken.js";

export const authRouter = express.Router();

authRouter.get("/decode",verifyToken,decodeJwt)
authRouter.post("/signup",signup)
authRouter.post("/signin",signin)