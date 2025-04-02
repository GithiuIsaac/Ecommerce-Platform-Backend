import { Schema, model } from "mongoose";

// Each document is a unique combination of a customer and a product
// One customer can have multiple wishlist items (different products)

// This structure allows for:
// - Tracking products on the wishlist per customer
// - Easy linking to customer and product details

const wishlistSchema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    sellerName: {
      type: String,
      required: true,
    },
    sellerId: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
  },
  // Automatically add and manage the createdAt and updatedAt fields
  { timestamps: true }
);

const wishlistModel = model("wishlist_products", wishlistSchema);

export default wishlistModel;
