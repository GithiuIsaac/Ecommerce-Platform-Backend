import productModel from "../../models/productModel.js";
import categoryModel from "../../models/categoryModel.js";
import { responseReturn } from "../../utilities/response.js";

class homeControllers {
  formatProduct = (products) => {
    // This method formats the products data before sending the response back to the frontend
    const productArray = [];
    let i = 0;
    while (i < products.length) {
      let temp = [];
      let j = i;
      while (j < i + 3) {
        if (products[j]) {
          temp.push(products[j]);
        }
        j++;
      }

      productArray.push([...temp]);
      i = j;
    }
    return productArray;
  };

  get_categories = async (req, res) => {
    // console.log(req);
    // Retrieve the category data from the DB
    console.log("Fetching categories from the DB...");
    try {
      // Return all category data from the db
      const categories = await categoryModel.find({});
      responseReturn(res, 200, { categories });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_products = async (req, res) => {
    // Retrieve the product data from the DB
    console.log("Fetching products from the DB...");
    try {
      // Return all product data from the db, limit 16
      const products = await productModel
        .find({})
        .limit(12)
        .sort({ createdAt: -1 });

      // Return Latest, Top rated, & Discounted Products
      const latestProducts = await productModel
        .find({})
        .limit(6)
        .sort({ createdAt: -1 });
      const latest_products = this.formatProduct(latestProducts);

      // Sort by rating
      const topProducts = await productModel
        .find({})
        .limit(6)
        .sort({ rating: -1 });
      const top_products = this.formatProduct(topProducts);

      // Sort by discount
      const discountProducts = await productModel
        .find({})
        .limit(6)
        .sort({ discount: -1 });
      const discount_products = this.formatProduct(discountProducts);

      responseReturn(res, 200, {
        products,
        latest_products,
        top_products,
        discount_products,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
}
export default new homeControllers();
