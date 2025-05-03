import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import adminModel from "../models/adminModel.js";
import sellerModel from "../models/sellerModel.js";
import sellerCustomerModel from "../models/chat/sellerCustomerModel.js";
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

  seller_login = async (req, res) => {
    // Confirm the data received from the frontend
    // console.log(req.body);

    // Destructure the received data
    const { email, password } = req.body;
    try {
      const seller = await sellerModel.findOne({ email }).select("+password");
      // console.log(seller);
      if (seller) {
        // Check if the seller email exists
        // Once email is found, check if the password is correct
        const isPasswordMatch = await bcrypt.compare(password, seller.password);
        // console.log(isPasswordMatch);

        if (isPasswordMatch) {
          // If password is correct, generate token & return success message
          const token = await createToken({
            id: seller.id,
            role: seller.role,
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
        responseReturn(res, 404, { error: "Email not found" });
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
        // Confirm created seller
        console.log(seller);
        await sellerCustomerModel.create({
          userId: seller.id,
          userType: "seller",
        });
        // generate token
        const token = await createToken({
          id: seller.id,
          role: seller.role,
        });

        // Create access cookie
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
          // expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        responseReturn(res, 201, { token, message: "Registration successful" });
      }
    } catch (error) {
      // Confirm error message
      console.log(error);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  get_user = async (req, res) => {
    const { id, role } = req;
    try {
      if (role === "admin") {
        // If admin, fetch the user info from the adminModel
        const admin = await adminModel.findById(id);
        responseReturn(res, 200, { userInfo: admin });
      } else {
        // If seller, fetch the user info from the sellerModel
        const seller = await sellerModel.findById(id);
        responseReturn(res, 200, { userInfo: seller });
      }
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: error.message });
      // responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  // Function to handle profile image upload
  add_profile_image = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });

    // Use _ since the fields data is not required.
    // Only image files are required
    form.parse(req, async (err, _, files) => {
      const { image } = files;

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      // Note, formidable returns values as arrays,
      // so even for single values, access the first array index
      try {
        const result = await cloudinary.uploader.upload(image[0].filepath, {
          folder: "profiles",
        });

        if (result) {
          // Get the current seller from the sellerModel, and update the image property
          await sellerModel.findByIdAndUpdate(id, {
            image: result.secure_url,
          });
          // Fetch the updated seller info to return in response
          const userInfo = await sellerModel.findById(id);
          responseReturn(res, 201, {
            message: "Profile image added successfully",
            userInfo,
          });
        } else {
          responseReturn(res, 400, { error: "Image upload failed" });
        }
      } catch (error) {
        console.error("Error updating profile image:", error);
        responseReturn(res, 500, { error: error.message });
      }
    });
  };

  // Add the user's profile information
  add_user_profile = async (req, res) => {
    // Confirm the data received from the frontend
    // console.log(req.body);

    // Destructure the received data
    const { seller_name, location, town } = req.body;
    const { id } = req;

    try {
      await sellerModel.findByIdAndUpdate(id, {
        sellerInfo: {
          seller_name,
          location,
          town,
        },
      });

      const userInfo = await sellerModel.findById(id);

      responseReturn(res, 201, {
        message: "Profile Info added successfully.",
        userInfo,
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  change_password = async (req, res) => {
    const { seller_email, current_password, new_password } = req.body;

    try {
      const user = await sellerModel
        .findOne({ email: seller_email })
        .select("+password");
      if (!user) {
        return responseReturn(res, 404, { error: "Email not found" });
      } else {
        // Compare the entered password with the stored password for the user
        const isPasswordMatch = await bcrypt.compare(
          current_password,
          user.password
        );
        if (!isPasswordMatch) {
          return responseReturn(res, 401, {
            error: "Current password is incorrect",
          });
        } else {
          user.password = await bcrypt.hash(new_password, 10);
          await user.save();
          responseReturn(res, 200, {
            message: "Password changed successfully",
          });
        }
      }
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  logout = async (req, res) => {
    try {
      // Clear the accessToken cookie
      res.cookie("accessToken", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      responseReturn(res, 200, { message: "Logout successful" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

export default new authControllers();
