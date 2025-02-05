import adminModel from "../models/adminModel.js";
import sellerModel from "../models/sellerModel.js";
import { responseReturn } from "../utilities/response.js";
import { createToken } from "../utilities/tokenCreate.js";
import bcrypt from "bcrypt";

class authControllers {
  admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await adminModel.findOne({ email }).select("+password");
      // console.log(admin);
      if (admin) {
        // Check if the user email exists
        // Once email is found, check if the password is correct
        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        // console.log(isPasswordMatch);

        if (isPasswordMatch) {
          // If password is correct, generate token & return success message
          const token = await createToken({
            id: admin.id,
            role: admin.role,
          });

          // Create access cookie
          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
            // expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          });
          responseReturn(res, 200, {
            token,
            message: "Login successful",
          });
        } else {
          // If incorrect password, return error message
          responseReturn(res, 401, { error: "Wrong password" });
        }
      } else {
        // If user does not exist, return error message
        responseReturn(res, 404, { error: "User not found" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
    // console.log(req.body);
  };

  seller_register = async (req, res) => {
    // Confirm the data received from the frontend
    // console.log(req.body);

    // Destructure the received data
    const { name, email, password } = req.body;

    try {
      // Check whether the provided email exists
      const getUser = await sellerModel.findOne({ email });
      if (getUser) {
        // If email exists, return error message
        // The request conflicts with an existing resource or state
        // 409 specifically implies that the client's request is valid, but cannot be completed due to a conflict with existing data
        responseReturn(res, 409, { error: "Email already exists" });
      } else {
        // If email does not exist, create a new user
        const seller = await sellerModel.create({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          method: "manual",
          sellerInfo: {},
        });
        console.log(seller);
        responseReturn(res, 201, {
          message: "Registration successful",
          seller,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  get_user = async (req, res) => {
    const { id, role } = req;
    try {
      if (role === "admin") {
        // Display if admin
        const user = await adminModel.findById(id);
        responseReturn(res, 200, { userInfo: user });
      } else {
        // Display if user/seller
        console.log("Seller Information");
      }
    } catch (error) {
      console.log(error.message);
      // responseReturn(res, 500, { error: error.message });
    }
  };
}

export default new authControllers();
