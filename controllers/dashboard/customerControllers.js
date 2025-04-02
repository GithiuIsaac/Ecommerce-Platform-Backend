import customerOrderModel from "../../models/customerOrderModel.js";
import adminOrderModel from "../../models/adminOrderModel.js";
import cartModel from "../../models/cartModel.js";
import moment from "moment";
import { responseReturn } from "../../utilities/response.js";
import mongoose from "mongoose";

const { ObjectId } = mongoose.mongo;

class customerControllers {
  get_dashboard_data = async (req, res) => {
    // console.log(req.params);
    const { customerId } = req.params;

    try {
      const recentOrders = await customerOrderModel
        .find({ customerId: new ObjectId(customerId) })
        .sort({ createdAt: -1 })
        .limit(5);
      const totalOrderCount = await customerOrderModel
        .find({ customerId: new ObjectId(customerId) })
        .countDocuments();
      const pendingOrderCount = await customerOrderModel
        .find({
          customerId: new ObjectId(customerId),
          delivery_status: "pending_payment",
        })
        .countDocuments();
      const deliveredOrderCount = await customerOrderModel
        .find({
          customerId: new ObjectId(customerId),
          delivery_status: "fulfilled",
        })
        .countDocuments();
      const cancelledOrderCount = await customerOrderModel
        .find({
          customerId: new ObjectId(customerId),
          delivery_status: "cancelled",
        })
        .countDocuments();

      responseReturn(res, 200, {
        recentOrders,
        totalOrderCount,
        pendingOrderCount,
        deliveredOrderCount,
        cancelledOrderCount,
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_customer_orders = async (req, res) => {
    const { customerId, status } = req.params;

    try {
      let orders = [];
      if (status !== "all") {
        orders = await customerOrderModel
          .find({
            customerId: new ObjectId(customerId),
            delivery_status: status,
          })
          .sort({ createdAt: -1 });
      } else {
        orders = await customerOrderModel
          .find({ customerId: new ObjectId(customerId) })
          .sort({ createdAt: -1 });
      }
      responseReturn(res, 200, {
        orders,
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_order_details = async (req, res) => {
    const { orderId } = req.params;

    try {
      const myOrder = await customerOrderModel.findById(orderId);
      responseReturn(res, 200, {
        myOrder,
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };
}

export default new customerControllers();
