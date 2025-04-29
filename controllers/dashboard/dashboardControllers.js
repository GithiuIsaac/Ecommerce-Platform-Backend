import productModel from "../../models/productModel.js";
import adminOrderModel from "../../models/adminOrderModel.js";
import customerOrderModel from "../../models/customerOrderModel.js";
import shopWalletModel from "../../models/payment/shopWalletModel.js";
import sellerModel from "../../models/sellerModel.js";
import adminSellerMsgModel from "../../models/chat/adminSellerMessages.js";
import { responseReturn } from "../../utilities/response.js";

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

      const recentMessages = await adminSellerMsgModel.find({}).limit(3);
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
}
export default new dashboardControllers();
