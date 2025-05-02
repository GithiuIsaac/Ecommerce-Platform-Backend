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
    // console.log("Fetching categories from the DB...");
    // console.log(req.query);
    const { page, searchValue, perPage } = req.query;
    // const skipPage = parseInt(perPage) * (parseInt(page) - 1);

    try {
      let skipPage = "";
      if (page && perPage) {
        skipPage = parseInt(perPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && perPage) {
        // Fetch categories from categories table
        const categories = await categoryModel
          .find({
            $text: { $search: searchValue },
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        // Return the total number of categories
        const totalCategories = await categoryModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();

        responseReturn(res, 200, {
          categories,
          totalCategories,
        });
      } else if (searchValue === "" && page && perPage) {
        // Fetch categories from categories table
        const categories = await categoryModel
          .find({})
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        // Return the total number of categories
        const totalCategories = await categoryModel.find({}).countDocuments();

        responseReturn(res, 200, {
          categories,
          totalCategories,
        });
      } else {
        // Return all categories data in the categories section
        const categories = await categoryModel.find({}).sort({ createdAt: -1 });
        const totalCategories = await categoryModel.find({}).countDocuments();

        responseReturn(res, 200, {
          categories,
          totalCategories,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  update_category = async (req, res) => {
    const { categoryId } = req.params;
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: "Sonething went wrong" });
      } else {
        let { category_name } = fields;
        let { image } = files;
        category_name = category_name[0].trim();
        const slug = category_name.split(" ").join("-").toLowerCase();

        try {
          let result = null;
          const updateData = {
            category_name,
            slug,
          };
          if (image) {
            cloudinary.config({
              cloud_name: process.env.cloud_name,
              api_key: process.env.api_key,
              api_secret: process.env.api_secret,
              secure: true,
            });
            // console.log("Image present, uploading to cloudinary...");
            result = await cloudinary.uploader.upload(image[0].filepath, {
              folder: "categories",
            });
          }

          if (result) {
            updateData.image = result.secure_url;
          }

          const category = await categoryModel.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true }
          );

          responseReturn(res, 201, {
            message: "Category updated successfully",
            category,
          });
        } catch (error) {
          // console.log(error.message);
          responseReturn(res, 500, { error: "Internal Server Error" });
        }
      }
    });
  };
}
export default new categoryControllers();
