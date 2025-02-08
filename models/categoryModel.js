import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    category_name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({
  category_name: "text",
});

const categoryModel = model("categories", categorySchema);

export default categoryModel;
