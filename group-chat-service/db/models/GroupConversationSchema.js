import mongoose from "mongoose";
import { BaseSchema } from "./BaseSchema.js";
import { messageSchema } from "./MessageSchema.js";

const GroupConversationSchema = new mongoose.Schema({
  ...BaseSchema,
  name: {
    type: String,
    required: true,
  },
  participants: [
    {
      type: String,
      required: true,
    },
  ],
  messages:[messageSchema]
});

export const GroupConversationModel = mongoose.model(
  "GroupConversationSchema",
  GroupConversationSchema
);
