import categoryModel from "../../models/categoryModel.js";
import { responseReturn } from "../../utilities/response.js";

class homeControllers {
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
}
export default new homeControllers();
