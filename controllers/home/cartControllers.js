import { responseReturn } from "../../utilities/response.js";
import cartModel from "../../models/cartModel.js";
import sellerCustomerModel from "../../models/chat/sellerCustomerModel.js";
import { createToken } from "../../utilities/tokenCreate.js";
import bcrypt from "bcrypt";

class cartControllers {
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
        console.log(updatedProduct);
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
        console.log(cartProduct);
        responseReturn(res, 201, {
          message: "Successfully added to cart",
          cartProduct,
        });
      }
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, {
        error: error.message,
      });
    }
  };

  get_product_count = async (req, res) => {
    // Destructure customerId from the request body
    // console.log(req.body);
    const { customerId } = req.body;
    // console.log(customerId);
    try {
      // countDocuments() counts documents matching a query
      // Returns how many cart items belong to a specific customer
      const productCount = await cartModel.countDocuments({
        customerId: customerId,
      });
      console.log(productCount);
      responseReturn(res, 200, { productCount });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}
export default new cartControllers();
