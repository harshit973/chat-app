import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true
    }
})

export const statusModal = mongoose.model("statusSchema",statusSchema)