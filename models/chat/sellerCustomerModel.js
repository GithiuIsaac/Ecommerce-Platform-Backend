// Creates the "seller_customers" table
import { Schema, model } from "mongoose";

const sellerCustomerSchema = new Schema(
  {
    sellerId: {
      type: String,
      required: true,
    },
    customerIds: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const sellerCustomerModel = model("seller_customers", sellerCustomerSchema);

export default sellerCustomerModel;
