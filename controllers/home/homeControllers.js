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
      // Return all product data from the db, limit 12
      // This will limit the products displayed on the home page to 12
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

  price_range_products = async (req, res) => {
    try {
      const priceRange = {
        low: 0,
        high: 0,
      };
      const products = await productModel
        .find({})
        .limit(9)
        .sort({ createdAt: -1 });
      const latest_products = this.formatProduct(products);

      // Return products sorted in ascending order by price
      const priceProducts = await productModel.find({}).sort({ price: 1 });

      // Dynamically generate the price range for all products
      if (priceProducts.length > 0) {
        // Get highest price in the returned products - Last index
        priceRange.high = priceProducts[priceProducts.length - 1].price;
        // Get lowest price in the returned products - First index
        priceRange.low = priceProducts[0].price;
      }
      // console.log(priceRange);
      responseReturn(res, 200, { products, latest_products, priceRange });
    } catch (error) {
      console.log(error.message);
    }
  };
}
export default new homeControllers();
