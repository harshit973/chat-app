import express, { json } from 'express'
import dotenv from "dotenv"
import { authRouter } from './routes/AuthRoute.js';
import { connectToMongoDb } from './db/ConnectToMongoDb.js';
import cookieParser from 'cookie-parser';
import { userRouter } from './routes/UserRouter.js';
import { getHealth } from './HealthView.js';

const app = express();
dotenv.config()
const port = process.env.PORT || 8082
app.use(cookieParser())
app.use(express.json())
app.use('/auth',authRouter)
app.use('/users',userRouter)
app.use('/health',getHealth)
app.listen(port,()=>{
    connectToMongoDb()
    console.log(`Server is running on ${port}`)
})