import { Schema, model } from "mongoose";

const sellerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      default: "seller",
    },
    status: {
      type: String,
      default: "pending",
    },
    paymentAccount: {
      type: String,
      default: "inactive",
    },
    method: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    sellerInfo: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

sellerSchema.index(
  {
    name: "text",
    email: "text",
  },
  {
    // Assign priority while searching
    weights: {
      name: 5,
      email: 4,
    },
  }
);

const sellerModel = model("sellers", sellerSchema);

export default sellerModel;
