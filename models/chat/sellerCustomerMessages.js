// Creates the "seller_customer_msgs" table
import { Schema, model } from "mongoose";

const sellerCustomerMsgSchema = new Schema(
  {
    senderName: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "unseen",
    },
  },
  { timestamps: true }
);

const sellerCustomerMsgModel = model(
  "seller_customer_msgs",
  sellerCustomerMsgSchema
);

export default sellerCustomerMsgModel;
