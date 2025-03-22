import { Schema, model } from "mongoose";

const customerOrderSchema = new Schema(
  {
    customerId: {
      // References a customer document using MongoDB ObjectId
      type: Schema.ObjectId,
      required: true,
    },
    order_products: {
      type: Array,
      required: true,
    },
    order_price: {
      type: Number,
      required: true,
    },
    payment_status: {
      type: String,
      required: true,
      default: "pending",
    },
    shipping_details: {
      type: Object,
      required: true,
    },
    delivery_status: {
      type: String,
      required: true,
      default: "pending_payment",
    },
    order_date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const customerOrderModel = model("customer_orders", customerOrderSchema);

export default customerOrderModel;
