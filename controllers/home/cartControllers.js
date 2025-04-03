import { responseReturn } from "../../utilities/response.js";
import cartModel from "../../models/cartModel.js";
import mongoose from "mongoose";
import wishlistModel from "../../models/wishlistModel.js";

const { ObjectId } = mongoose.mongo;

class cartControllers {
  computeCommission(price) {
    const COMMISSION_PERCENTAGE = 5;
    return Math.round(((price * COMMISSION_PERCENTAGE) / 100) * 100) / 100;
  }

  computePrice(price, quantity, discount) {
    if (discount === 0) {
      // No discount: original price * quantity
      return Math.round(price * quantity * 100) / 100;
    }
    // With discount: (original price - discount) * quantity
    const discountedPrice =
      price - Math.round(((price * discount) / 100) * 100) / 100;
    return discountedPrice * quantity;
  }

  add_to_cart = async (req, res) => {
    // console.log(req.body);

    // Destructure the req data
    const { customerId, quantity, productId } = req.body;

    try {
      // Searches the cart collection for a document
      // Returns the first document that matches BOTH conditions

      // More concise query
      //   const product = await cartModel.findOne({
      //     productId: productId,
      //     customerId: customerId
      // });
      const product = await cartModel.findOne({
        // AND operator - both conditions must be true
        $and: [
          {
            productId: {
              // First condition: DB productId equals provided productId
              $eq: productId,
            },
          },
          {
            customerId: {
              // Second condition: DB customerId equals provided customerId
              $eq: customerId,
            },
          },
        ],
      });
      if (product) {
        // Product already exists in cart
        // This is not an error condition - it's a valid business case
        // Update the quantity & Return 200 OK with informative response
        // Update existing cart item quantity
        const updatedProduct = await cartModel.findOneAndUpdate(
          // first argument - filter condition to find which document to update
          // productId field matches the productId from the request AND the customerId field matches the customerId from the request
          { productId: productId, customerId: customerId },
          { quantity: product.quantity + quantity },
          { new: true }
        );
        // console.log(updatedProduct);
        responseReturn(res, 200, {
          message: "Already added to the cart, updated quantity successfully.",
          updatedProduct,
        });
      } else {
        // Create a new cart item
        const cartProduct = await cartModel.create({
          customerId,
          productId,
          quantity,
        });
        // Return the new productCount for the customer
        const productCount = await cartModel.countDocuments({
          customerId: customerId,
        });
        // console.log(cartProduct);
        responseReturn(res, 201, {
          message: "Successfully added to cart",
          cartProduct,
          productCount,
        });
      }
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, {
        error: error.message,
      });
    }
  };

  // This function is meant to be called by the Header component when a customer first loads the page
  get_product_count = async (req, res) => {
    // Destructure customerId from the query params
    // console.log(req.query);
    const { customerId } = req.query;
    // console.log(customerId);
    try {
      // countDocuments() counts documents matching a query
      // Returns how many cart items belong to a specific customer
      const productCount = await cartModel.countDocuments({
        customerId: customerId,
      });
      // console.log(`There are ${productCount} products in the cart`);
      responseReturn(res, 200, { productCount });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // Retrieve and organize cart products for a specific customer
  get_cart_products = async (req, res) => {
    // Destructure customerId from the request params
    const { customerId } = req.params;
    try {
      // Find all cart items for a specific customer
      // cartModel.aggregate - runs an aggregation pipeline on the cartModel collection
      // $match stage - Filters documents where the customerId matches the provided customerId
      // $eq: new ObjectId(customerId) - Converts customerId to an ObjectId and checks for equality with the provided customerId
      const cartProducts = await cartModel.aggregate([
        {
          $match: {
            customerId: {
              $eq: new ObjectId(customerId),
              // Returns all cart products for this user
            },
          },
        },

        // $lookup stage - Joins data from the 'products' collection to the cartModel collection
        // Outputs a products_data array with an object which can be used to access all the fields in the "from" collection
        {
          $lookup: {
            from: "products", // The collection to join
            localField: "productId", // The field from the input documents
            foreignField: "_id", // The field from the documents of the "from" collection
            as: "products_data", // The output array field
          },
        },

        // // $unwind stage - Deconstructs an array field from the input documents to output a document for each element
        // {
        //   $unwind: "$products_data",
        // },

        // // $project stage - Specifies the fields to include in the output documents
        // {
        //   $project: {
        //     _id: 1,
        //     customerId: 1, // Include the customerId field
        //     productId: 1, // Include the productId field
        //     quantity: 1, // Include the quantity field
        //     // product: "$products_data",
        //     product_name: "$products_data.product_name",
        //     seller_name: "$products_data.seller_name",
        //     price: "$products_data.price",
        //     brand: "$products_data.brand",
        //     stock: "$products_data.stock",
        //     discount: "$products_data.discount",
        //     sellerId: "$products_data.sellerId",
        //     image: { $arrayElemAt: ["$products_data.images", 0] },
        //   },
        // },
      ]);

      // console.log(cartProducts);

      // Initialize counters
      // let buy_product_item = 0; // Total quantity of in-stock items
      // let calculatePrice = 0; // Total price of all in-stock items
      // let cart_product_count = 0; // Number of products in the cart

      // Split products into in-stock and out-of-stock
      // products_data[0] - Access the fields in the products_data array specified above
      // When the stock is less than the cart quantity, the product is out of stock
      const outOfStockProducts = cartProducts.filter(
        (product) => product.products_data[0].stock < product.quantity
      );
      console.log("Out of stock:", outOfStockProducts);

      // Product is in stock if the stock quantity is greater than or equal to the cart quantity
      const stockProducts = cartProducts.filter(
        (product) => product.products_data[0].stock >= product.quantity
      );
      // console.log("Products in stock:", stockProducts);

      // Calculate total quantity of out-of-stock items
      const outOfStockQuantity = outOfStockProducts.reduce(
        (sum, product) => sum + product.quantity,
        0
      );
      console.log("Out of stock quantity:", outOfStockQuantity);

      // Calculate total quantity of in stock items
      const inStockQuantity = stockProducts.reduce(
        (sum, product) => sum + product.quantity,
        0
      );
      console.log("Products in stock quantity:", inStockQuantity);

      // Group products by seller
      let cartItemsBySeller = [];
      // Get unique seller IDs - creates an array of unique seller IDs
      let uniqueSellerIds = [
        ...new Set(
          stockProducts.map((p) => p.products_data[0].sellerId.toString())
        ),
      ];

      // loops through each unique seller
      for (let i = 0; i < uniqueSellerIds.length; i++) {
        // Total price for each seller
        let sellerTotal = 0;
        // Loop through all products - checks each product to see if it belongs to the current seller being processed.
        for (let j = 0; j < stockProducts.length; j++) {
          const tempProduct = stockProducts[j].products_data[0];
          // Check if product belongs to current seller
          if (tempProduct.sellerId.toString() === uniqueSellerIds[i]) {
            // Calculate price for this product with discount if applicable
            const productTotal =
              Math.round(
                this.computePrice(
                  tempProduct.price,
                  stockProducts[j].quantity,
                  tempProduct.discount
                ) * 100
              ) / 100;

            // Add to seller's total
            sellerTotal += productTotal;

            // Group products by seller
            cartItemsBySeller[i] = {
              sellerId: uniqueSellerIds[i],
              sellerName: tempProduct.seller_name,
              price:
                Math.round(
                  (sellerTotal + this.computeCommission(sellerTotal)) * 100
                ) / 100,
              products_data: cartItemsBySeller[i]
                ? [
                    // If seller already has products
                    ...cartItemsBySeller[i].products_data,
                    // Keep existing products, append new product
                    {
                      //
                      _id: stockProducts[j]._id,
                      // product_name: stockProduct[j].products_data[0].product_name,
                      // brand: stockProduct[j].products_data[0].brand,
                      quantity: stockProducts[j].quantity,
                      // price: stockProduct[j].products_data[0].price,
                      // discount: stockProduct[j].products_data[0].discount,
                      // image: stockProduct[j].products_data[0].images[0]
                      productInfo: tempProduct,
                      productTotal,
                    },
                  ]
                : [
                    // If first product for this seller
                    {
                      _id: stockProducts[j]._id,
                      // product_name: stockProduct[j].products_data[0].product_name,
                      // brand: stockProduct[j].products_data[0].brand,
                      quantity: stockProducts[j].quantity,
                      // price: stockProduct[j].products_data[0].price,
                      // discount: stockProduct[j].products_data[0].discount,
                      // image: stockProduct[j].products_data[0].images[0]
                      productInfo: tempProduct,
                      productTotal,
                    },
                  ],
            };
          }
        }
      }

      // Calculate total price from seller groups
      const totalPrice =
        Math.round(
          cartItemsBySeller.reduce((sum, seller) => sum + seller.price, 0) * 100
        ) / 100;

      // console.log("Products grouped by seller", cartItemsBySeller);

      // console.log("The calculated price is:", totalPrice);

      responseReturn(res, 200, {
        cartProducts: cartItemsBySeller,
        outOfStockProducts,
        cartTotalPrice: totalPrice,
        cartProductCount: inStockQuantity + outOfStockQuantity,
        inStockQuantity,
        shippingFee: 500 * cartItemsBySeller.length,
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_cart_products_opt = async (req, res) => {
    // Destructure customerId from the request params
    const { customerId } = req.params;
    try {
      // Find all cart items for a specific customer
      // cartModel.aggregate - runs an aggregation pipeline on the cartModel collection
      // $match stage - Filters documents where the customerId matches the provided customerId
      // $eq: new ObjectId(customerId) - Converts customerId to an ObjectId and checks for equality with the provided customerId
      const cartProducts = await cartModel.aggregate([
        {
          $match: {
            customerId: {
              $eq: new ObjectId(customerId),
              // Returns all cart products for this user
            },
          },
        },

        // $lookup stage - Joins data from the 'products' collection to the cartModel collection
        // Outputs a products_data array with an object which can be used to access all the fields in the "from" collection
        {
          $lookup: {
            from: "products", // The collection to join
            localField: "productId", // The field from the input documents
            foreignField: "_id", // The field from the documents of the "from" collection
            as: "products_data", // The output array field
          },
        },

        // $unwind stage - Deconstructs an array field from the input documents to output a document for each element
        {
          $unwind: "$products_data",
        },

        // $project stage - Specifies the fields to include in the output documents
        {
          $project: {
            _id: 1,
            customerId: 1, // Include the customerId field
            productId: 1, // Include the productId field
            quantity: 1, // Include the quantity field
            // product: "$products_data",
            product_name: "$products_data.product_name",
            seller_name: "$products_data.seller_name",
            price: "$products_data.price",
            brand: "$products_data.brand",
            stock: "$products_data.stock",
            discount: "$products_data.discount",
            sellerId: "$products_data.sellerId",
            image: { $arrayElemAt: ["$products_data.images", 0] },
          },
        },
      ]);

      console.log(cartProducts);

      // Initialize counters
      // let buy_product_item = 0; // Total quantity of in-stock items
      // let calculatePrice = 0; // Total price of all in-stock items
      // let cart_product_count = 0; // Number of products in the cart

      // Split products into in-stock and out-of-stock
      // products_data[0] - Access the fields in the products_data array specified above
      // When the stock is less than the cart quantity, the product is out of stock
      // const outOfStockProducts = cartProducts.filter(
      //   (product) => product.products_data[0].stock < product.quantity
      // );
      // console.log("Out of stock:", outOfStockProducts);

      // // Product is in stock if the stock quantity is greater than or equal to the cart quantity
      // const stockProducts = cartProducts.filter(
      //   (product) => product.products_data[0].stock >= product.quantity
      // );
      // // console.log("Products in stock:", stockProducts);

      // // Calculate total quantity of out-of-stock items
      // const outOfStockQuantity = outOfStockProducts.reduce(
      //   (sum, product) => sum + product.quantity,
      //   0
      // );
      // console.log("Out of stock quantity:", outOfStockQuantity);

      // // Calculate total quantity of in stock items
      // const inStockQuantity = stockProducts.reduce(
      //   (sum, product) => sum + product.quantity,
      //   0
      // );
      // console.log("Products in stock quantity:", inStockQuantity);

      // // Group products by seller
      // let cartItemsBySeller = [];
      // // Get unique seller IDs - creates an array of unique seller IDs
      // let uniqueSellerIds = [
      //   ...new Set(
      //     stockProducts.map((p) => p.products_data[0].sellerId.toString())
      //   ),
      // ];

      // // loops through each unique seller
      // for (let i = 0; i < uniqueSellerIds.length; i++) {
      //   // Total price for each seller
      //   let sellerTotal = 0;
      //   // Loop through all products - checks each product to see if it belongs to the current seller being processed.
      //   for (let j = 0; j < stockProducts.length; j++) {
      //     const tempProduct = stockProducts[j].products_data[0];
      //     // Check if product belongs to current seller
      //     if (tempProduct.sellerId.toString() === uniqueSellerIds[i]) {
      //       // Calculate price for this product with discount if applicable
      //       const productTotal = this.computePrice(
      //         tempProduct.price,
      //         stockProducts[j].quantity,
      //         tempProduct.discount
      //       );

      //       // Add to seller's total
      //       sellerTotal += productTotal;

      //       // Group products by seller
      //       cartItemsBySeller[i] = {
      //         sellerId: uniqueSellerIds[i],
      //         sellerName: tempProduct.seller_name,
      //         price: sellerTotal + this.computeCommission(sellerTotal),
      //         products_data: cartItemsBySeller[i]
      //           ? [
      //               // If seller already has products
      //               ...cartItemsBySeller[i].products_data,
      //               // Keep existing products, append new product
      //               {
      //                 //
      //                 _id: stockProducts[j]._id,
      //                 // product_name: stockProduct[j].products_data[0].product_name,
      //                 // brand: stockProduct[j].products_data[0].brand,
      //                 quantity: stockProducts[j].quantity,
      //                 // price: stockProduct[j].products_data[0].price,
      //                 // discount: stockProduct[j].products_data[0].discount,
      //                 // image: stockProduct[j].products_data[0].images[0]
      //                 productInfo: tempProduct,
      //                 productTotal,
      //               },
      //             ]
      //           : [
      //               // If first product for this seller
      //               {
      //                 _id: stockProducts[j]._id,
      //                 // product_name: stockProduct[j].products_data[0].product_name,
      //                 // brand: stockProduct[j].products_data[0].brand,
      //                 quantity: stockProducts[j].quantity,
      //                 // price: stockProduct[j].products_data[0].price,
      //                 // discount: stockProduct[j].products_data[0].discount,
      //                 // image: stockProduct[j].products_data[0].images[0]
      //                 productInfo: tempProduct,
      //                 productTotal,
      //               },
      //             ],
      //       };
      //     }
      //   }
      // }

      // // Calculate total price from seller groups
      // const totalPrice = cartItemsBySeller.reduce(
      //   (sum, seller) => sum + seller.price,
      //   0
      // );

      // console.log("Products grouped by seller", cartItemsBySeller);

      // console.log("The calculated price is:", totalPrice);

      // responseReturn(res, 200, {
      //   cartProducts: cartItemsBySeller,
      //   outOfStockProducts,
      //   cartTotalPrice: totalPrice,
      //   cartProductCount: inStockQuantity + outOfStockQuantity,
      //   inStockQuantity,
      //   shippingFee: 500 * cartItemsBySeller.length,
      // });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };

  delete_cart_product = async (req, res) => {
    // Destructure cartId from the request params
    const { cartId } = req.params;
    console.log(cartId);
    try {
      // Find the cart item by its ID and delete it
      await cartModel.findByIdAndDelete(cartId);
      responseReturn(res, 200, {
        message: "Product removed from cart",
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };

  increase_quantity = async (req, res) => {
    // Destructure cartId from the request params
    const { cartId } = req.params;
    try {
      // Find the cart item by its ID
      const cartProduct = await cartModel.findById(cartId);
      console.log(cartProduct);
      // Increase the quantity by 1
      const { quantity } = cartProduct;
      await cartModel.findByIdAndUpdate(cartId, { quantity: quantity + 1 });
      responseReturn(res, 200, {
        message: "Product quantity updated",
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };

  decrease_quantity = async (req, res) => {
    // Destructure cartId from the request params
    const { cartId } = req.params;
    try {
      // Find the cart item by its ID
      const cartProduct = await cartModel.findById(cartId);
      // Decrease the quantity by 1
      const { quantity } = cartProduct;
      await cartModel.findByIdAndUpdate(cartId, { quantity: quantity - 1 });
      responseReturn(res, 200, {
        message: "Product quantity decreased",
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };

  add_to_wishlist = async (req, res) => {
    // console.log(req.body);
    // Destructure the req data
    const {
      customerId,
      productId,
      productName,
      price,
      image,
      discount,
      rating,
      sellerName,
      sellerId,
      slug,
    } = req.body;

    try {
      // Searches the wishlist collection for a document
      // Returns the first document that matches BOTH conditions

      // More concise query
      //   const product = await cartModel.findOne({
      //     productId: productId,
      //     customerId: customerId
      // });
      const product = await wishlistModel.findOne({
        // AND operator - both conditions must be true
        $and: [
          {
            productId: {
              // First condition: DB productId equals provided productId
              $eq: productId,
            },
          },
          {
            customerId: {
              // Second condition: DB customerId equals provided customerId
              $eq: customerId,
            },
          },
        ],
      });
      if (product) {
        // Product already exists in wishlist
        // Inform the customer that the product is already on the wishlist
        responseReturn(res, 409, {
          error: "Product is already on the wishlist.",
        });
      } else {
        // Create a new wishlist item
        const wishlistProduct = await wishlistModel.create({
          customerId,
          productId,
          productName,
          price,
          image,
          discount,
          rating,
          sellerName,
          sellerId,
          slug,
        });
        // Return the new wishlistCount for the customer
        const wishlistCount = await wishlistModel.countDocuments({
          customerId: customerId,
        });
        responseReturn(res, 201, {
          message: "Product successfully added to wishlist",
          wishlistProduct,
          wishlistCount,
        });
      }
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, {
        error: error.message,
      });
    }
  };

  // This function is meant to be called by the Header component when a customer first loads the page
  get_wishlist_count = async (req, res) => {
    // Destructure customerId from the query params
    const { customerId } = req.query;
    try {
      // countDocuments() counts documents matching a query
      // Returns how many wishlist items belong to a specific customer
      const wishlistCount = await wishlistModel.countDocuments({
        customerId: customerId,
      });
      responseReturn(res, 200, { wishlistCount });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_wishlist_products = async (req, res) => {
    // Destructure customerId from the request params
    const { customerId } = req.params;
    try {
      const wishlistProducts = await wishlistModel.find({
        customerId: customerId,
      });
      const wishlistCount = wishlistProducts.length;
      responseReturn(res, 200, { wishlistProducts, wishlistCount });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };
}
export default new cartControllers();
