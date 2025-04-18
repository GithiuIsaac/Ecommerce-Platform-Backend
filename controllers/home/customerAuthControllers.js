import { responseReturn } from "../../utilities/response.js";
import customerModel from "../../models/customerModel.js";
import sellerCustomerModel from "../../models/chat/sellerCustomerModel.js";
import { createToken } from "../../utilities/tokenCreate.js";
import bcrypt from "bcrypt";

class customerAuthControllers {
  customer_login = async (req, res) => {
    // Confirm the data received from the frontend
    // console.log(req.body);

    // Destructure the received data
    const { email, password } = req.body;
    try {
      // Search for the first doc in customerModel where the email field matches the provided email
      // Returns a single document (customer) or null if not found
      // password field is typically defined with select: false for security reasons, meaning it's excluded from query results by default
      // Using select("+password") explicitly includes the password field in this query result
      const customer = await customerModel
        .findOne({ email })
        .select("+password");

      if (customer) {
        // Check if the customer email exists
        // Once email is found, check if the password is correct
        const isPasswordMatch = await bcrypt.compare(
          password,
          customer.password
        );

        if (isPasswordMatch) {
          // If password is correct, generate token & return success message
          const token = await createToken({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            method: customer.method,
          });

          // Create access cookie
          res.cookie("customerToken", token, {
            // expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
  };

  customer_register = async (req, res) => {
    // Confirm the data received from the frontend
    // console.log(req.body);

    // Destructure the received data
    const { name, email, password } = req.body;

    try {
      // Check whether the provided email exists
      const getCustomer = await customerModel.findOne({ email });
      if (getCustomer) {
        // If email exists, return error message
        // The request conflicts with an existing resource or state
        // 409 specifically implies that the client's request is valid, but cannot be completed due to a conflict with existing data
        responseReturn(res, 409, { error: "Email already exists" });
      } else {
        // If email does not exist, create a new customer
        const customer = await customerModel.create({
          name: name.trim(),
          email: email.trim(),
          password: await bcrypt.hash(password, 10),
          method: "manual",
        });
        // Confirm created customer
        console.log(customer);

        await sellerCustomerModel.create({
          sellerId: customer.id,
        });

        responseReturn(res, 201, { message: "Registration successful" });
      }
    } catch (error) {
      // Confirm error message
      console.log(error.message);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  customer_logout = async (req, res) => {
    // Clear the customerToken cookie
    // res.clearCookie("customerToken");
    res.cookie("customerToken", "", {
      expires: new Date(Date.now()),
    });
    responseReturn(res, 200, { message: "You are now logged out." });
  };
}
export default new customerAuthControllers();
