import sellerModel from "../../models/sellerModel.js";
import { responseReturn } from "../../utilities/response.js";
import paymentAccountModel from "../../models/payment/paymentAccountModel.js";
import Stripe from "stripe";
import { v4 } from "uuid";
import sellerWalletModel from "../../models/payment/sellerWalletModel.js";
import paymentRequestModel from "../../models/payment/paymentRequests.js";

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

  // Calculate sum by iterating on the amount property.
  sumAmount = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i].amount;
    }
    return sum;
  };

  seller_payment_details = async (req, res) => {
    // console.log(req.params);
    const { sellerId } = req.params;
    // Payments for each order for a particular seller are stored in the sellerWalletModel
    // When a payment/withdrawal request is made, this info is stored in the paymentRequestModel
    try {
      // Get the completed seller's payments from the sellerWalletModel
      const sellerPayments = await sellerWalletModel.find({ sellerId });

      const pendingWithdrawals = await paymentRequestModel.find({
        $and: [
          {
            sellerId: {
              $eq: sellerId,
            },
          },
          {
            request_status: {
              $eq: "pending",
            },
          },
        ],
      });

      const successfulWithdrawals = await paymentRequestModel.find({
        $and: [
          {
            sellerId: {
              $eq: sellerId,
            },
          },
          {
            request_status: {
              $eq: "completed",
            },
          },
        ],
      });

      const pendingAmount = this.sumAmount(pendingWithdrawals);
      const withdrawnAmount = this.sumAmount(successfulWithdrawals);
      const totalSalesAmount = this.sumAmount(sellerPayments);

      let availableAmount = 0;

      if (totalSalesAmount > 0) {
        availableAmount = totalSalesAmount - (pendingAmount + withdrawnAmount);
      }
      responseReturn(res, 200, {
        totalSalesAmount,
        pendingAmount,
        withdrawnAmount,
        availableAmount,
        successfulWithdrawals,
        pendingWithdrawals,
      });
    } catch (error) {
      console.log("Error getting seller payment details: ", error.message);
    }
  };

  submit_payment_request = async (req, res) => {
    // Destructure the data received from the frontend
    const { amount, sellerId } = req.body;
    try {
      // Create the payment request in the paymentRequest table
      const paymentRequest = await paymentRequestModel.create({
        sellerId,
        amount: parseInt(amount),
      });

      responseReturn(res, 200, {
        message: "Withdrawal request submitted successfully",
        paymentRequest,
      });
    } catch (error) {
      responseReturn(res, 500, {
        error:
          "Internal Server Error: Withdrawal request could not be submitted.",
      });
    }
  };
}
export default new paymentControllers();
