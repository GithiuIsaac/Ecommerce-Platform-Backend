import formidable from "formidable";
import sellerModel from "../../models/sellerModel.js";
import { responseReturn } from "../../utilities/response.js";
import { v2 as cloudinary } from "cloudinary";

class sellerControllers {
  add_category = async (req, res) => {};

  get_seller_requests = async (req, res) => {
    console.log(req.query);

    // Destructure the received query from the frontend
    const { page, searchValue, perPage } = req.query;
    const skipPage = parseInt(perPage) * (parseInt(page) - 1);
    try {
      // Retrieve sellers where status is either "pending" or "inactive"
      if (searchValue) {
        const sellers = await sellerModel.find({
          $text: { $search: searchValue },
          status: { $in: ["pending", "inactive"] },
        });
        responseReturn(res, 200, { sellers });
      } else {
        const sellers = await sellerModel
          .find({ status: { $in: ["pending", "inactive"] } })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        // Return the total number of sellers with pending or inactive status
        const totalSellers = await sellerModel
          .find({
            status: { $in: ["pending", "inactive"] },
          })
          .countDocuments();

        console.log(sellers, totalSellers);
        responseReturn(res, 200, {
          sellers,
          totalSellers,
        });
      }
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_seller = async (req, res) => {
    const { sellerId } = req.params;

    console.log("Fetching seller details by id...", sellerId);

    try {
      const seller = await sellerModel.findById(sellerId);
      responseReturn(res, 200, { seller });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 404, { error: "Seller not found" });
    }
  };

  update_seller_status = async (req, res) => {
    // Destructure the received query from the frontend
    const { sellerId, status } = req.body;

    console.log("Updating seller status...", sellerId, status);

    try {
      await sellerModel.findByIdAndUpdate(sellerId, {
        status,
      });
      const seller = await sellerModel.findById(sellerId);
      responseReturn(res, 200, {
        seller,
        message: "Seller status updated successfully.",
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 404, { error: "Seller not found" });
    }
  };

  get_sellers = async (req, res) => {
    // Retrieve the category data from the DB
    // console.log("Fetching categories from the DB...");
    // console.log(req.query);
    const { page, searchValue, perPage } = req.query;
    // const skipPage = parseInt(perPage) * (parseInt(page) - 1);

    try {
      let skipPage = "";
      if (page && perPage) {
        skipPage = parseInt(perPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && perPage) {
        // Fetch sellers from the sellers table
        const sellers = await sellerModel
          .find({
            $text: { $search: searchValue },
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        // Return the total number of sellers
        const totalSellers = await sellerModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();

        responseReturn(res, 200, {
          sellers,
          totalSellers,
        });
      } else if (searchValue === "" && page && perPage) {
        // Fetch sellers from the sellers table
        const sellers = await sellerModel
          .find({})
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        // Return the total number of sellers
        const totalSellers = await categoryModel.find({}).countDocuments();

        responseReturn(res, 200, {
          sellers,
          totalSellers,
        });
      } else {
        // Return all sellers data in the sellers section
        const sellers = await categoryModel.find({}).sort({ createdAt: -1 });
        const totalSellers = await categoryModel.find({}).countDocuments();

        responseReturn(res, 200, {
          sellers,
          totalSellers,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  get_active_sellers = async (req, res) => {
    // console.log("Active Sellers: ", req.query);
    const { page, searchValue, perPage } = req.query;
    const skipPage = parseInt(perPage) * (parseInt(page) - 1);

    try {
      if (searchValue) {
        // Retrieve sellers where status is "active"
        const sellers = await sellerModel
          .find({
            $text: { $search: searchValue },
            status: "active",
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        const totalSellers = await sellerModel
          .find({
            $text: { $search: searchValue },
            status: "active",
          })
          .countDocuments();

        responseReturn(res, 200, { sellers, totalSellers });
      } else {
        const sellers = await sellerModel
          .find({
            status: "active",
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        // Return the total number of sellers with active status
        const totalSellers = await sellerModel
          .find({
            status: "active",
          })
          .countDocuments();

        responseReturn(res, 200, { sellers, totalSellers });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  get_inactive_sellers = async (req, res) => {
    // console.log("Active Sellers: ", req.query);
    const { page, searchValue, perPage } = req.query;
    const skipPage = parseInt(perPage) * (parseInt(page) - 1);
    try {
      if (searchValue) {
        // Retrieve sellers where status is "inactive"
        const sellers = await sellerModel
          .find({
            $text: { $search: searchValue },
            status: "inactive",
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalSellers = await sellerModel
          .find({
            $text: { $search: searchValue },
            status: "inactive",
          })
          .countDocuments();
        responseReturn(res, 200, { sellers, totalSellers });
      } else {
        const sellers = await sellerModel
          .find({
            status: "inactive",
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        // Return the total number of sellers with inactive status
        const totalSellers = await sellerModel
          .find({
            status: "inactive",
          })
          .countDocuments();
        responseReturn(res, 200, { sellers, totalSellers });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
}
export default new sellerControllers();
