import { Schema, model } from "mongoose";

const bannerSchema = new Schema({
  productId: {
    // References the product document using MongoDB ObjectId
    type: Schema.ObjectId,
    required: true,
  },
  banner_image_url: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
},
  { timestamps: true });

const bannerModel = model("banner_images", bannerSchema);

export default bannerModel;
