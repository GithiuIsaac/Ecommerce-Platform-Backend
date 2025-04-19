// Creates the "seller_customer_msgs" table
import { Schema, model } from "mongoose";

const adminSellerMsgSchema = new Schema(
  {
    senderName: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      default: "",
    },
    // receiverName: {
    //   type: String,
    //   required: true,
    // },
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

const adminSellerMsgModel = model("admin_seller_msgs", adminSellerMsgSchema);

export default adminSellerMsgModel;
