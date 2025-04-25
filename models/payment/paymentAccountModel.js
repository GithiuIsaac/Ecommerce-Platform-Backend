import { Schema, model } from "mongoose";

const paymentAccountSchema = new Schema(
  {
    sellerId: {
      // References a seller document using MongoDB ObjectId
      type: Schema.ObjectId,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const paymentAccountModel = model("payment_accounts", paymentAccountSchema);

export default paymentAccountModel;
