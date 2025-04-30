import productModel from "../../models/productModel.js";
import adminOrderModel from "../../models/adminOrderModel.js";
import customerOrderModel from "../../models/customerOrderModel.js";
import shopWalletModel from "../../models/payment/shopWalletModel.js";
import sellerModel from "../../models/sellerModel.js";
import adminSellerMsgModel from "../../models/chat/adminSellerMessages.js";
import sellerCustomerMsgModel from "../../models/chat/sellerCustomerMessages.js";
import { responseReturn } from "../../utilities/response.js";
import sellerWalletModel from "../../models/payment/sellerWalletModel.js";
import mongoose from "mongoose";

const { ObjectId } = mongoose.mongo;

class dashboardControllers {
  get_admin_dashboard = async (req, res) => {
    const { id } = req;
    try {
      const totalSalesAmount = await shopWalletModel.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);
      // console.log("Total Sales Amount: ", totalSalesAmount[0]?.totalAmount);

      const totalProducts = await productModel.find({}).countDocuments();
      // console.log("Total Products: ", totalProducts);

      const totalOrders = await customerOrderModel.find({}).countDocuments();
      // console.log("Total Orders: ", totalOrders);

      const totalSellers = await sellerModel.find({}).countDocuments();
      // console.log("Total Sellers: ", totalSellers);

      const recentMessages = await adminSellerMsgModel
        .find({
          receiverName: "Admin",
        })
        .limit(3)
        .sort({ createdAt: -1 });
      // console.log("Recent Messages: ", recentMessages);

      const recentOrders = await customerOrderModel.find({}).limit(5);
      // console.log("Recent Orders: ", recentOrders);

      responseReturn(res, 200, {
        totalSalesAmount: totalSalesAmount[0]?.totalAmount,
        totalProducts,
        totalOrders,
        totalSellers,
        recentMessages,
        recentOrders,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_seller_dashboard = async (req, res) => {
    const { id } = req;
    // console.log(id);
    try {
      const totalSales = await sellerWalletModel.aggregate([
        {
          $match: {
            sellerId: {
              $eq: id,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);
      // console.log("Total Sales Amount: ", totalSales[0]?.totalAmount);

      const totalProducts = await productModel
        .find({
          sellerId: new ObjectId(id),
        })
        .countDocuments();
      // console.log("Total Products: ", totalProducts);

      const totalOrders = await adminOrderModel
        .find({
          sellerId: new ObjectId(id),
        })
        .countDocuments();
      // console.log("Total Orders: ", totalOrders);

      const pendingOrders = await adminOrderModel
        .find({
          $and: [
            // the $and operator combines two conditions that must both be true
            {
              sellerId: {
                $eq: new ObjectId(id),
              },
            },
            {
              delivery_status: {
                $in: ["pending_payment", "pending", "processing"],
              },
            },
          ],
        })
        .countDocuments();
      // Simplified version
      // const pendingOrders = await adminOrderModel.find({
      //   sellerId: new ObjectId(id),
      //   delivery_status: { $in: ["pending_payment", "pending", "processing"] }
      // });
      // console.log("Pending Orders: ", pendingOrders);

      // Recent customer messages sent to the current seller
      const recentMessages = await sellerCustomerMsgModel
        .find({
          receiverId: id,
        })
        .limit(3)
        .sort({ createdAt: -1 });
      // console.log("Recent Messages: ", recentMessages);

      const recentOrders = await adminOrderModel
        .find({ sellerId: new ObjectId(id) })
        .limit(5);
      // console.log("Recent Orders: ", recentOrders);

      responseReturn(res, 200, {
        totalSalesAmount: totalSales[0]?.totalAmount,
        totalProducts,
        totalOrders,
        pendingOrders,
        recentMessages,
        recentOrders,
      });
    } catch (error) {}
  };
}
export default new dashboardControllers();
