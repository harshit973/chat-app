import express from "express"
import verifyToken from "../middleware/verifyToken.js";
import { getStatus } from "../controller/StatusController.js";

const router = express.Router();

router.use(verifyToken)

router.post('/', getStatus);


export default router;