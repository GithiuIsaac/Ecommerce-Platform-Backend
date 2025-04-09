// Creates the "seller_customers" table
import { Schema, model } from "mongoose";

const sellerCustomerSchema = new Schema(
  {
    userId: {
      // can be either sellerId or customerId
      type: String,
      required: true,
    },
    userType: {
      // to identify if this record belongs to a seller or customer
      type: String,
      enum: ["seller", "customer"],
      required: true,
    },
    linkedUsers: {
      // array of connected users (either sellers or customers)
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const sellerCustomerModel = model("seller_customers", sellerCustomerSchema);

export default sellerCustomerModel;
