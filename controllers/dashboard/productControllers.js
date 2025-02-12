import formidable from "formidable";
import productModel from "../../models/productModel.js";
import { responseReturn } from "../../utilities/response.js";
import { v2 as cloudinary } from "cloudinary";

class productControllers {
  add_product = async (req, res) => {
    const { id } = req;
    console.log("Adding a new product by...", id);
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: "Sonething went wrong" });
      } else {
        // Process all fields to get the first element and trim it
        const processField = (field) =>
          Array.isArray(field) ? field[0].trim() : field.trim();

        const product_name = processField(fields.product_name);
        const category = processField(fields.category);
        const description = processField(fields.description);
        const stock = processField(fields.stock);
        const price = processField(fields.price);
        const discount = processField(fields.discount);
        const seller_name = processField(fields.seller_name);
        const brand = processField(fields.brand);

        const { images } = files;
        // Log the values to determine the structure
        // console.log(fields);
        // console.log(images[0]);

        const slug = product_name.split(" ").join("-").toLowerCase();

        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });

        try {
          console.log("Trying to upload the product images...");
          let allImageUrls = [];

          for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.uploader.upload(
              images[i].filepath,
              {
                folder: "products",
              }
            );
            allImageUrls = [...allImageUrls, result.secure_url];
          }

          console.log("Product images uploaded successfully.", allImageUrls);

          console.log("Adding product data to DB...");
          const product = await productModel.create({
            sellerId: id,
            product_name,
            slug,
            category,
            description,
            stock: parseInt(stock),
            price: parseInt(price),
            discount: parseInt(discount),
            seller_name,
            brand: brand,
            images: allImageUrls,
          });
          // .maxTimeMS(30000);

          console.log("New product added successfully.");
          responseReturn(res, 201, {
            message: "Product added successfully",
            product,
          });
        } catch (error) {
          console.error("Error adding product:", error);
          responseReturn(res, 500, { error: error.message });
          // responseReturn(res, 500, { error: error });
        }
      }
    });
  };

  get_products = async (req, res) => {
    // Retrieve the product data from the DB
    console.log("Fetching products from the DB...");
    console.log(req.query);
    const { page, searchValue, perPage } = req.query;
    // // const skipPage = parseInt(perPage) * (parseInt(page) - 1);

    try {
      let skipPage = "";
      if (page && perPage) {
        skipPage = parseInt(perPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && perPage) {
        // Fetch products from products table
        const products = await productModel
          .find({
            $text: { $search: searchValue },
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        // Return the total number of products
        const totalProducts = await productModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();

        responseReturn(res, 200, {
          products,
          totalProducts,
        });
      } else if (searchValue === "" && page && perPage) {
        // Fetch products from products table
        const products = await productModel
          .find({})
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        // Return the total number of products
        const totalProducts = await productModel.find({}).countDocuments();

        responseReturn(res, 200, {
          products,
          totalProducts,
        });
      } else {
        // Return all products data in the products section
        const products = await productModel.find({}).sort({ createdAt: -1 });
        const totalProducts = await productModel.find({}).countDocuments();

        responseReturn(res, 200, {
          products,
          totalProducts,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
}
export default new productControllers();
