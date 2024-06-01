import mongoose from "mongoose";
import { BaseSchema } from "./BaseSchema.js";

const ChatRequestSchema = new mongoose.Schema({
    ...BaseSchema,
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: null
    }
})

export const ChatRequestModel = mongoose.model("ChatRequestModel",ChatRequestSchema)