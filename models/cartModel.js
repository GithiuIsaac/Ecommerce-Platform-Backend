import { Schema, model } from "mongoose";

// Each document is a unique combination of a customer and a product
// One customer can have multiple cart items (different products)
// Each cart item tracks its quantity

// This structure allows for:
// - Tracking multiple products per customer
// - Quantity management per product
// - Timestamp tracking for cart changes
// - Easy linking to customer and product details

const cartSchema = new Schema(
  {
    customerId: {
      // References a customer document using MongoDB ObjectId
      type: Schema.ObjectId,
      required: true,
    },
    productId: {
      // References a product document using MongoDB ObjectId
      type: Schema.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  // Automatically add and manage the createdAt and updatedAt fields
  { timestamps: true }
);

const cartModel = model("cart_products", cartSchema);

export default cartModel;
