import mongoose from "mongoose";
import { BaseSchema } from "./BaseSchema.js";

const InvitationSchema = new mongoose.Schema({
    ...BaseSchema,
    conversationId: {
        type: String,
        required: true
    },
    expiryInSec: {
        type: Number,
        required: true
    }
})

export const InvitationModal = mongoose.model("InvitationSchema",InvitationSchema)