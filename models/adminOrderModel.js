import { Schema, model } from "mongoose";

const adminOrderSchema = new Schema(
  {
    orderId: {
      // References an order document using MongoDB ObjectId
      type: Schema.ObjectId,
      required: true,
    },
    sellerId: {
      // References a seller document using MongoDB ObjectId
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
      type: String,
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

const adminOrderModel = model("admin_orders", adminOrderSchema);

export default adminOrderModel;
