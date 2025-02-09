import formidable from "formidable";
import categoryModel from "../../models/categoryModel.js";
import { responseReturn } from "../../utilities/response.js";
import { v2 as cloudinary } from "cloudinary";

class categoryControllers {
  add_category = async (req, res) => {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: "Sonething went wrong" });
      } else {
        let { category_name } = fields;
        let { image } = files;
        category_name = category_name[0].trim();
        if (Array.isArray(files.image)) {
          image = image[0];
        }
        if (!image || !image.filepath) {
          return responseReturn(res, 400, { error: "Image file is required" });
        }
        const slug = category_name.split(" ").join("-").toLowerCase();

        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });

        try {
          console.log("Trying to upload the image...");
          const result = await cloudinary.uploader.upload(image.filepath, {
            folder: "categories",
          });
          if (result) {
            const category = await categoryModel.create({
              category_name,
              slug,
              image: result.secure_url,
            });
            responseReturn(res, 201, {
              message: "Category added successfully",
              category,
            });
          } else {
            responseReturn(res, 400, { error: "Image upload failed" });
          }
        } catch (error) {
          responseReturn(res, 500, { error: "Internal Server Error" });
        }
      }
    });
  };

  get_category = async (req, res) => {
    // Retrieve the category data from the DB
    console.log("Fetching categories from the DB...");
  };
}
export default new categoryControllers();
