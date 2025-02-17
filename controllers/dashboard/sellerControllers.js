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
      // Retrieve sellers where status is "pending"
      if (searchValue) {
        const sellers = await sellerModel.find({
          $text: { $search: searchValue },
          status: "pending",
        });
        responseReturn(res, 200, { sellers });
      } else {
        const sellers = await sellerModel
          .find({ status: "pending" })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        // Return the total number of sellers with the pending status
        const totalSellers = await sellerModel
          .find({
            status: "pending",
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
    // try {
    //   let skipPage = "";
    //   if (page && perPage) {
    //     skipPage = parseInt(perPage) * (parseInt(page) - 1);
    //   }
    //   if (searchValue && page && perPage) {
    //     // Fetch sellers from the sellers table
    //     const sellers = await sellerModel
    //       .find({
    //         $text: { $search: searchValue },
    //       })
    //       .skip(skipPage)
    //       .limit(perPage)
    //       .sort({ createdAt: -1 });

    //     // Return the total number of sellers
    //     const totalSellers = await sellerModel
    //       .find({
    //         $text: { $search: searchValue },
    //       })
    //       .countDocuments();

    //     responseReturn(res, 200, {
    //       sellers,
    //       totalSellers,
    //     });
    //   } else if (searchValue === "" && page && perPage) {
    //     // Fetch sellers from the sellers table
    //     const sellers = await sellerModel
    //       .find({})
    //       .skip(skipPage)
    //       .limit(perPage)
    //       .sort({ createdAt: -1 });

    //     // Return the total number of sellers
    //     const totalSellers = await categoryModel.find({}).countDocuments();

    //     responseReturn(res, 200, {
    //       sellers,
    //       totalSellers,
    //     });
    //   } else {
    //     // Return all sellers data in the sellers section
    //     const sellers = await categoryModel.find({}).sort({ createdAt: -1 });
    //     const totalSellers = await categoryModel.find({}).countDocuments();

    //     responseReturn(res, 200, {
    //       sellers,
    //       totalSellers,
    //     });
    //   }
    // } catch (error) {
    //   console.log(error.message);
    // }
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
}
export default new sellerControllers();
