import formidable from "formidable";
// import productModel from "../../models/productModel.js";
import { responseReturn } from "../../utilities/response.js";
import { v2 as cloudinary } from "cloudinary";

class productControllers {
  add_product = async (req, res) => {
    console.log("Adding a new product...");
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      console.log(files);
      console.log(fields);

      let { product_name } = fields;
      let { images } = files;
      console.log(product_name);
      console.log(images[0]);
    });
    // form.parse(req, async (err, fields, files) => {
    //   if (err) {
    //     responseReturn(res, 404, { error: "Sonething went wrong" });
    //   } else {
    //     let { product_name } = fields;
    //     let { image } = files;
    //     product_name = product_name[0].trim();
    //     if (Array.isArray(files.image)) {
    //       image = image[0];
    //     }
    //     if (!image || !image.filepath) {
    //       return responseReturn(res, 400, { error: "Image file is required" });
    //     }
    //     const slug = product_name.split(" ").join("-").toLowerCase();

    //     cloudinary.config({
    //       cloud_name: process.env.cloud_name,
    //       api_key: process.env.api_key,
    //       api_secret: process.env.api_secret,
    //       secure: true,
    //     });

    //     try {
    //       console.log("Trying to upload the image...");
    //       const result = await cloudinary.uploader.upload(image.filepath, {
    //         folder: "categories",
    //       });
    //       if (result) {
    //         const product = await productModel.create({
    //           product_name,
    //           slug,
    //           image: result.secure_url,
    //         });
    //         responseReturn(res, 201, {
    //           message: "product added successfully",
    //           product,
    //         });
    //       } else {
    //         responseReturn(res, 400, { error: "Image upload failed" });
    //       }
    //     } catch (error) {
    //       responseReturn(res, 500, { error: "Internal Server Error" });
    //     }
    //   }
    // });
  };

  get_product = async (req, res) => {
    // Retrieve the product data from the DB
    console.log("Fetching products from the DB...");
    console.log(req.query);
    // const { page, searchValue, perPage } = req.query;
    // // const skipPage = parseInt(perPage) * (parseInt(page) - 1);

    // try {
    //   let skipPage = "";
    //   if (page && perPage) {
    //     skipPage = parseInt(perPage) * (parseInt(page) - 1);
    //   }
    //   if (searchValue && page && perPage) {
    //     // Fetch categories from categories table
    //     const categories = await productModel
    //       .find({
    //         $text: { $search: searchValue },
    //       })
    //       .skip(skipPage)
    //       .limit(perPage)
    //       .sort({ createdAt: -1 });

    //     // Return the total number of categories
    //     const totalCategories = await productModel
    //       .find({
    //         $text: { $search: searchValue },
    //       })
    //       .countDocuments();

    //     responseReturn(res, 200, {
    //       categories,
    //       totalCategories,
    //     });
    //   } else if (searchValue === "" && page && perPage) {
    //     // Fetch categories from categories table
    //     const categories = await productModel
    //       .find({})
    //       .skip(skipPage)
    //       .limit(perPage)
    //       .sort({ createdAt: -1 });

    //     // Return the total number of categories
    //     const totalCategories = await productModel.find({}).countDocuments();

    //     responseReturn(res, 200, {
    //       categories,
    //       totalCategories,
    //     });
    //   } else {
    //     // Return all categories data in the categories section
    //     const categories = await productModel.find({}).sort({ createdAt: -1 });
    //     const totalCategories = await productModel.find({}).countDocuments();

    //     responseReturn(res, 200, {
    //       categories,
    //       totalCategories,
    //     });
    //   }
    // } catch (error) {
    //   console.log(error.message);
    // }
  };
}
export default new productControllers();
