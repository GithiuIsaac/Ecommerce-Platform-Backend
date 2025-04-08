import productModel from "../../models/productModel.js";
import categoryModel from "../../models/categoryModel.js";
import { responseReturn } from "../../utilities/response.js";
import queryProducts from "../../utilities/queryProducts.js";
import reviewModel from "../../models/ReviewModel.js";
import moment from "moment";
import mongoose from "mongoose";

const { ObjectId } = mongoose.mongo;

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

  query_products = async (req, res) => {
    // Set up pagination with 12 items per page and add it to the query parameters.
    const perPage = 12;
    req.query.perPage = perPage;
    // console.log("Running the query_products method...");
    console.log(req.query);
    try {
      // Retrieve all products from the DB, sorted by creation date (newest first)
      const products = await productModel.find({}).sort({ createdAt: -1 });

      // Create a single instance of queryProducts and apply the common filters:
      const queryInstance = new queryProducts(products, req.query)
        .categoryQuery()
        .ratingQuery()
        .priceQuery()
        .searchQuery()
        .sortByPrice();

      // console.log(
      //   "Query instance products length:",
      //   queryInstance.products.length
      // );

      // Get total count after filtering but before pagination
      const totalProducts = queryInstance.countProducts();

      // Apply pagination and get results
      const resultProducts = queryInstance.skip().limit().getProducts();

      // // Getting Total Count:
      // // - First instance of queryProducts to get the total count
      // // - Apply all filters and call countProducts() to get total number of products after filtering
      // const totalProducts = new queryProducts(products, req.query)
      //   .categoryQuery()
      //   .ratingQuery()
      //   .priceQuery()
      //   .sortByPrice()
      //   .countProducts();

      // // Getting Page Results:
      // // - Second instance of queryProducts for the actual results
      // // - Use skip() and limit() for pagination
      // // - Get the final products for current page
      // const resultProducts = new queryProducts(products, req.query)
      //   .categoryQuery()
      //   .ratingQuery()
      //   .priceQuery()
      //   .sortByPrice()
      //   .skip()
      //   .limit()
      //   .getProducts();

      responseReturn(res, 200, {
        products: resultProducts,
        totalProducts,
        perPage,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_product_details = async (req, res) => {
    // Retrieve the product's details from the DB
    const { slug } = req.params;
    try {
      const product = await productModel.findOne({ slug });
      // console.log(product);

      // Return products with the same category, excluding the id for the product already being displayed.
      const relatedProducts = await productModel
        .find({
          $and: [{ category: product.category }, { _id: { $ne: product._id } }],
        })
        .limit(12);

      // Return products from the same seller/vendor - limit to 3
      const sellerProducts = await productModel
        .find({
          $and: [{ sellerId: product.sellerId }, { _id: { $ne: product._id } }],
        })
        .limit(3);

      responseReturn(res, 200, { product, relatedProducts, sellerProducts });
    } catch (error) {
      console.log(error.message);
    }
  };

  submit_review = async (req, res) => {
    // Destructure the review_data passed in from the frontend
    const { name, customerId, review, rating, productId } = req.body;

    try {
      // Create the review in the reviews table
      await reviewModel.create({
        name,
        customerId,
        productId,
        review,
        rating,
        date: moment(Date.now()).format("LL"),
      });

      // Calculate total ratings for the product
      let ratings = 0;
      const reviews = await reviewModel.find({ productId });
      for (let i = 0; i < reviews.length; i++) {
        ratings += reviews[i].rating;
      }

      // Calculate average product rating based on number of ratings
      let product_rating = 0;
      if (reviews.length !== 0) {
        product_rating = (ratings / reviews.length).toFixed(1);
      }

      // Update the product's rating in the products table
      await productModel.findByIdAndUpdate(productId, {
        rating: product_rating,
      });

      responseReturn(res, 201, { message: "Review added successfully" });
    } catch (error) {}
  };

  get_product_reviews = async (req, res) => {
    // This method should:
    // - return all the product reviews, filtered by the provided pagination
    // - return the total number of reviews for the product
    // - calculate the rating distribution, how many 5, 4, 3, 2, 1 stars for the product
    // - calculate the average rating

    // console.log(req.params);
    // console.log(req.query);
    const { productId } = req.params;
    let { page } = req.query;
    page = parseInt(page);

    const limit = 5;
    const skipPage = limit * (page - 1);
    try {
      const getRating = await reviewModel.aggregate([
        {
          $match: {
            productId: {
              $eq: new ObjectId(productId),
            },
            rating: {
              $not: {
                $size: 0,
              },
            },
          },
        },
        {
          $unwind: "$rating",
        },
        {
          $group: {
            _id: "$rating",
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      console.log(getRating);
      // Group the reviews by rating
      let ratingReview = [
        { rating: 5, sum: 0 },
        { rating: 4, sum: 0 },
        { rating: 3, sum: 0 },
        { rating: 2, sum: 0 },
        { rating: 1, sum: 0 },
      ];
      console.log(ratingReview);

      for (let i = 0; i < ratingReview.length; i++) {
        for (let j = 0; j < getRating.length; j++) {
          if (ratingReview[i].rating === getRating[j]._id) {
            ratingReview[i].sum = getRating[j].count;
            break;
          }
        }
      }
      console.log(ratingReview);

      const allReviews = await reviewModel.find({ productId });

      const reviews = await reviewModel
        .find({ productId })
        .skip(skipPage)
        .limit(limit)
        .sort({ createdAt: -1 });

      responseReturn(res, 200, {
        reviews,
        totalReviews: allReviews.length,
        ratingReview,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
}
export default new homeControllers();
