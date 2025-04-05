import { Schema, model } from "mongoose";

// Each document is a unique combination of a customer and a product
// One customer can have multiple reviews for multiple products, but only one for a specific product.

// This structure allows for:
// - Tracking products reviews per customer
// - Easy linking to customer reviews and products

const reviewSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
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
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
      required: true,
    },
  },
  // Automatically add and manage the createdAt and updatedAt fields
  { timestamps: true }
);

const reviewModel = model("reviews", reviewSchema);

export default reviewModel;
