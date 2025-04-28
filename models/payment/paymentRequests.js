import { Schema, model } from "mongoose";

const paymentRequestSchema = new Schema(
  {
    sellerId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    request_status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

const paymentRequestModel = model("payment_requests", paymentRequestSchema);

export default paymentRequestModel;
