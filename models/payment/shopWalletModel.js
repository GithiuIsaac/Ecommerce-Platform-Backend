import { Schema, model } from "mongoose";

const shopWalletSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const shopWalletModel = model("shop_wallets", shopWalletSchema);

export default shopWalletModel;
