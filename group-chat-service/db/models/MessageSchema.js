import mongoose from "mongoose";
import { BaseSchema } from "./BaseSchema.js";


export const messageSchema = new mongoose.Schema({
  ...BaseSchema,
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  }
});
