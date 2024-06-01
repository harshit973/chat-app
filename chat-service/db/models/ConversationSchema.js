import mongoose from "mongoose";
import { BaseSchema } from "./BaseSchema.js";
import { messageSchema } from "./MessageSchema.js";

const ConversationSchema = new mongoose.Schema({
  ...BaseSchema,
  participants: [
    {
      type: String,
      required: true,
    },
  ],
  messages: [messageSchema]
});

export const ConversationModel = mongoose.model(
  "ConversationSchema",
  ConversationSchema
);
