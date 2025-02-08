import adminModel from "../../models/adminModel.js";
import sellerModel from "../../models/sellerModel.js";
import sellerCustomerModel from "../../models/chat/sellerCustomerModel.js";
import { responseReturn } from "../../utilities/response.js";
import { createToken } from "../../utilities/tokenCreate.js";
import bcrypt from "bcrypt";

class categoryControllers {
  add_category = async (req, res) => {
    console.log("New Category Created", req.body);
  };
}
export default new categoryControllers();
