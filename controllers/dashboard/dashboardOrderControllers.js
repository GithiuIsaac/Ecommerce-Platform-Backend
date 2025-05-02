import adminOrderModel from "../../models/adminOrderModel.js";
import customerOrderModel from "../../models/customerOrderModel.js";
import { responseReturn } from "../../utilities/response.js";
import mongoose from "mongoose";

const { ObjectId } = mongoose.mongo;

class dashboardOrderControllers {
  get_admin_orders = async (req, res) => {
    // Destructure the data received from the frontend:
    let { page, searchValue, perPage } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);

    // Customer Order data is located in the CustomerOrderModel, and each order is specific to a customer
    // An order can consist of multiple products from different sellers.
    // The adminOrderModel stores seller related order information
    // The Admin order dashboard has two views:
    // - The entire order (customer order)
    // - The seller related order, which is the customer order grouped into the related sellers for the products in that order

    const skipPage = perPage * (page - 1);

    try {
      if (searchValue) {
        console.log("Search value is present: ", searchValue);
      } else {
        // Retrieve all the customer orders from the customerOrderModel
        const orders = await customerOrderModel
          .aggregate([
            {
              // Create a relationship with the admin_orders table
              $lookup: {
                from: "admin_orders",
                localField: "_id",
                foreignField: "orderId", // Field in the admin_orders table which references the customer_orders table _id field
                as: "sub_order",
              },
            },
          ])
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        // Return all the customer orders
        const allOrders = await customerOrderModel.aggregate([
          {
            // Create a relationship with the admin_orders table
            $lookup: {
              from: "admin_orders",
              localField: "_id",
              foreignField: "orderId", // Field in the admin_orders table which references the customer_orders table _id field
              as: "sub_order",
            },
          },
        ]);

        responseReturn(res, 200, {
          orders,
          totalOrders: allOrders.length,
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      // responseReturn(res, 500, { error: error.message });
    }
  };

  get_admin_order = async (req, res) => {
    const { orderId } = req.params;
    // console.log("Fetching order by id...", orderId);
    try {
      // const currentOrder = await customerOrderModel.findById(orderId);
      const order = await customerOrderModel.aggregate([
        {
          $match: { _id: new ObjectId(orderId) },
          // When the customer_orders table _id matches the orderId
        },
        {
          // Create a relationship with the admin_orders table
          $lookup: {
            from: "admin_orders",
            localField: "_id",
            foreignField: "orderId", // Field in the admin_orders table which references the customer_orders table _id field
            as: "sub_order",
          },
        },
      ]);
      responseReturn(res, 200, { currentOrder: order[0] });
    } catch (error) {
      console.log("Get Admin Order Details failed: ", error.message);
      // responseReturn(res, 404, { error: "Order not found" });
    }
  };

  admin_status_update = async (req, res) => {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    try {
      await customerOrderModel.findByIdAndUpdate(orderId, {
        delivery_status: orderStatus,
      });
      responseReturn(res, 200, { message: "Order status updated" });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, {
        error: "Internal Server Error. Unable to update order status",
      });
    }
  };

  get_seller_orders = async (req, res) => {
    // Destructure the data received from the frontend:
    // Ideally, a seller should only be able to access their orders, and thus the seller id
    const { sellerId } = req.params;
    let { page, searchValue, perPage } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);
    // const { id } = req;
    // console.log("Req Id: ", id);
    const skipPage = perPage * (page - 1);

    // The seller related customer orders are stored in the adminOrderModel
    try {
      if (searchValue) {
        console.log("Search value is present: ", searchValue);
      } else {
        // Retrieve all the customer orders for this seller from the adminOrderModel
        const orders = await adminOrderModel
          .find({ sellerId })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        // Return all the customer orders for this seller
        const totalOrders = await adminOrderModel
          .find({
            sellerId,
          })
          .countDocuments();

        responseReturn(res, 200, {
          orders,
          totalOrders,
        });
      }
    } catch (error) {
      console.log("Error: ", error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_seller_order = async (req, res) => {
    const { orderId } = req.params;
    try {
      const currentOrder = await adminOrderModel.findById(orderId);
      responseReturn(res, 200, { currentOrder });
    } catch (error) {
      console.log("Get Seller Order Details failed: ", error.message);
      // responseReturn(res, 404, { error: "Order not found" });
    }
  };

  seller_status_update = async (req, res) => {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    try {
      await adminOrderModel.findByIdAndUpdate(orderId, {
        delivery_status: orderStatus,
      });
      responseReturn(res, 200, { message: "Order status updated" });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, {
        error: "Internal Server Error. Unable to update order status",
      });
    }
  };
}
export default new dashboardOrderControllers();
