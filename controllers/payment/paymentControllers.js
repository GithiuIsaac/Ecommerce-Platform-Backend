import sellerModel from "../../models/sellerModel.js";
import { responseReturn } from "../../utilities/response.js";
import paymentAccountModel from "../../models/payment/paymentAccountModel.js";
import Stripe from "stripe";
import { v4 } from "uuid";

class paymentControllers {
  // Initialize Stripe with your secret key
  // stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  constructor() {
    this.stripe = new Stripe(
      "sk_test_51RHEBHQ6RIDGLuyfki7mTXNBiP164Wveh181QdW3C7WGJvmF2SwSBYqMDn6oSwp4ivUyfM2UIbVNo2QE0OtxeAWj00x3ObUHqn"
    );
  }

  connect_payment_account = async (req, res) => {
    console.log("Connect Payment Account for: ", req.id);
    const { id } = req;
    const uid = v4();
    console.log("uid: ", uid);

    try {
      // Check whether the current sellerId already has an associated account
      const paymentInfo = await paymentAccountModel.findOne({ sellerId: id });
      console.log("paymentInfo: ", paymentInfo);

      if (paymentInfo) {
        // Delete the existing account
        await paymentAccountModel.deleteOne({ sellerId: id });
        console.log("Deleted existing account...");
        // Create a new account
        const account = await this.stripe.accounts.create({
          type: "express",
        });
        console.log("account: ", account);

        const accountLink = await this.stripe.accountLinks.create({
          account: account.id,
          refresh_url: "http://localhost:3001/refresh",
          return_url: `http://localhost:3001/success?activeCode=${uid}`,
          type: "account_onboarding",
        });
        console.log("accountLink: ", accountLink);

        await paymentAccountModel.create({
          sellerId: id,
          stripeId: account.id,
          code: uid,
        });
        responseReturn(res, 201, { url: accountLink.url });
      } else {
        // Create a new account
        const account = await this.stripe.accounts.create({
          type: "express",
        });
        console.log("account: ", account);

        const accountLink = await this.stripe.accountLinks.create({
          account: account.id,
          refresh_url: "http://localhost:3001/refresh",
          return_url: `http://localhost:3001/success?activeCode=${uid}`,
          type: "account_onboarding",
        });
        console.log("accountLink: ", accountLink);

        await paymentAccountModel.create({
          sellerId: id,
          stripeId: account.id,
          code: uid,
        });
        responseReturn(res, 201, { url: accountLink.url });
      }
    } catch (error) {
      console.log("Error connecting Stripe account: ", error.message);
    }
  };

  enable_payment_account = async (req, res) => {
    const { activeCode } = req.params;
    const { id } = req;

    try {
      const paymentInfo = await paymentAccountModel.findOne({
        sellerId: id,
        code: activeCode,
      });

      if (paymentInfo) {
        // Update the seller's status to active
        await sellerModel.findByIdAndUpdate(id, {
          paymentAccount: "active",
        });
        // Delete the payment account
        // await paymentAccountModel.deleteOne({ sellerId: id });
        responseReturn(res, 200, {
          message: "Payment account enabled successfully",
        });
      } else {
        responseReturn(res, 404, { error: "Invalid active code" });
      }
    } catch (error) {
      console.log("Error enabling payment account: ", error.message);
      responseReturn(res, 500, {
        error: "Internal Server Error: Payment account could not be enabled.",
      });
    }
  };
}
export default new paymentControllers();
