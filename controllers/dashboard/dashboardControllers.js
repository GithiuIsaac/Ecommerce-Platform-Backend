import productModel from "../../models/productModel.js";
import adminOrderModel from "../../models/adminOrderModel.js";
import bannerModel from "../../models/bannerModel.js";
import customerOrderModel from "../../models/customerOrderModel.js";
import shopWalletModel from "../../models/payment/shopWalletModel.js";
import sellerModel from "../../models/sellerModel.js";
import adminSellerMsgModel from "../../models/chat/adminSellerMessages.js";
import sellerCustomerMsgModel from "../../models/chat/sellerCustomerMessages.js";
import { responseReturn } from "../../utilities/response.js";
import sellerWalletModel from "../../models/payment/sellerWalletModel.js";
import mongoose from "mongoose";
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";

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
    } catch (error) {
      console.log(error.message);
    }
  };

  add_banner = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      const { productId } = field;
      // console.log("Product ID: ", productId)
      const { productBanner } = files;
      // console.log("Main Banner: ", productBanner[0].filepath)

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      // formidable returns values as arrays,
      // so even for single values, access the first array index
      try {
        // Retrieve the product from the product Model using the productId
        const { slug } = await productModel.findById(productId);
        const result = await cloudinary.uploader.upload(
          productBanner[0].filepath,
          {
            folder: `products/banners/${slug}`,
          }
        );

        const banner = await bannerModel.create({
          productId,
          banner_image_url: result.secure_url,
          link: slug,
        });

        responseReturn(res, 200, {
          banner,
          message: "Banner added successfully",
        });
      } catch (error) {
        responseReturn(res, 500, {
          error: error.message,
        });
      }
    });
  };

  get_banner = async (req, res) => {
    const { productId } = req.params;
    try {
      const banner = await bannerModel.findOne({
        productId: new ObjectId(productId),
      });
      responseReturn(res, 200, { banner });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  update_banner = async (req, res) => {
    const { bannerId } = req.params;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, _, files) => {
      // The file items have been passed into the form from the frontend as below:
      // formData.append("productBanner", image);
      const { productBanner } = files;

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      try {
        // Retrieve the banner from the banner Model using the bannerId
        let banner = await bannerModel.findById(bannerId);

        // Replace the image in the cloudinary folder with the new image, keeping the rest of the url intact
        let imageUrl = banner.banner_image_url.split("/");
        let folderPath =
          imageUrl[imageUrl.length - 4] +
          "/" +
          imageUrl[imageUrl.length - 3] +
          "/" +
          imageUrl[imageUrl.length - 2];

        let imageId = banner.banner_image_url.split("/").pop().split(".")[0];

        // Delete the existing image with it's cloudinary public ID
        await cloudinary.uploader.destroy(folderPath + "/" + imageId);

        // Upload the new image
        const { secure_url } = await cloudinary.uploader.upload(
          productBanner[0].filepath,
          {
            folder: folderPath,
          }
        );

        // Update the banner_image_url in the banner Model using the bannerId
        await bannerModel.findByIdAndUpdate(bannerId, {
          banner_image_url: secure_url,
        });

        banner = await bannerModel.findById(bannerId);

        responseReturn(res, 200, {
          banner,
          message: "Banner updated successfully",
        });
      } catch (error) {
        responseReturn(res, 500, {
          error: error.message,
        });
      }
    });
  };

  get_banner_images = async (req, res) => {
    try {
      const bannerImages = await bannerModel.aggregate([
        {
          $sample: {
            size: 8,
          },
        },
      ]);
      responseReturn(res, 200, { bannerImages });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}
export default new dashboardControllers();
