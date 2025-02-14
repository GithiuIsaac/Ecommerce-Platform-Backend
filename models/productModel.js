import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    sellerId: {
      type: Schema.ObjectId,
      // ref: "sellers",
      required: true,
    },
    product_name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    seller_name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.index(
  {
    product_name: "text",
    category: "text",
    brand: "text",
    description: "text",
  },
  {
    // Assign priority while searching
    weights: {
      product_name: 5,
      category: 3,
      brand: 2,
      description: 1,
    },
  }
);

const productModel = model("products", productSchema);

export default productModel;
