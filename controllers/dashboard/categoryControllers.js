import formidable from "formidable";
import categoryModel from "../../models/categoryModel.js";
import { responseReturn } from "../../utilities/response.js";
import { createToken } from "../../utilities/tokenCreate.js";
import bcrypt from "bcrypt";

class categoryControllers {
  add_category = async (req, res) => {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      console.log("Fields", fields);
      console.log("Files", files);
      if (err) {
        responseReturn(res, 404, { error: "Sonething went wrong" });
      } else {
        let { category_name } = fields;
        let { image } = files;
        name = category_name.trim();
        const slug = name.split(" ").join("-").toLowerCase();
      }
    });
    console.log("New Category Created", req.body);
  };

  get_category = async (req, res) => {
    // Retrieve the category data from the DB
    console.log();
  };
}
export default new categoryControllers();
