import customerOrderModel from "../../models/customerOrderModel.js";
import adminOrderModel from "../../models/adminOrderModel.js";
import cartModel from "../../models/cartModel.js";
import moment from "moment";
import { responseReturn } from "../../utilities/response.js";
import Stripe from "stripe";

class orderControllers {
  // Initialize Stripe with your secret key
  // stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  constructor() {
    this.stripe = new Stripe(
      "sk_test_51RHEBHQ6RIDGLuyfki7mTXNBiP164Wveh181QdW3C7WGJvmF2SwSBYqMDn6oSwp4ivUyfM2UIbVNo2QE0OtxeAWj00x3ObUHqn"
    );
  }

  paymentCheck = async (id) => {
    try {
      const order = await customerOrderModel.findById(id);
      if (order.payment_status === "unpaid") {
        await customerOrderModel.findByIdAndUpdate(id, {
          delivery_status: "cancelled",
        });
        await adminOrderModel.updateMany(
          {
            orderId: id,
          },
          { delivery_status: "cancelled" }
        );
      }
      return true;
    } catch (error) {
      console.log(error);
      // responseReturn(res, 500, { error: error.message });
    }
  };
  // get_orders = async (req, res) => {
  //   const { customerId } = req.params;
  //   try {
  //     const orders = await customerOrderModel
  //       .find({ customerId: customerId })
  //       .sort({ createdAt: -1 });
  //     responseReturn(res, 200, { orders });
  //   } catch (error) {
  //     console.log(error.message);
  //     responseReturn(res, 500, { error: error.message });
  //   }
  // };
  // get_order = async (req, res) => {
  //   const { orderId } = req.params;
  //   try {
  //     const order = await customerOrderModel.findById(orderId);
  //     responseReturn(res, 200, { order });
  //   } catch (error) {
  //     console.log(error.message);
  //     responseReturn(res, 500, { error: error.message });
  //   }
  // };

  place_order = async (req, res) => {
    const {
      price,
      orderProducts,
      shippingFee,
      itemCount,
      tax,
      shippingDetails,
      customerId,
    } = req.body;

    let adminOrderData = [];
    // Keep track of the cartId so that once the order has been placed, the items can be removed from the cart
    let cartIds = [];
    const orderTime = moment(Date.now()).format("LLL");
    // console.log(orderTime);

    // The customer views their order as one, even when there are multiple sellers involved
    let customerOrderProducts = [];
    // Loop over the orderProducts array
    // Products in the orderProducts array are from the cartItemsBySeller, which groups products by their seller
    for (let i = 0; i < orderProducts.length; i++) {
      const sellerProducts = orderProducts[i].products_data;
      // Loop over the sellerProducts array, accessing the productInfo, and append the data to the customerOrderProducts.
      // This combines the customer's order into one object, regardless of the seller.
      for (let j = 0; j < sellerProducts.length; j++) {
        const product = sellerProducts[j].productInfo;
        // Add the quantity property to the product object.
        // This is the cart quantity - The number of items the customer ordered.
        product.quantity = sellerProducts[j].quantity;
        // console.log("Product is:", product);
        customerOrderProducts.push(product);

        if (sellerProducts[j]._id) {
          cartIds.push(sellerProducts[j]._id);
        }
      }
    }
    // console.log("Customer order products are:", customerOrderProducts);
    console.log("Cart IDs are:", cartIds);

    try {
      const customerOrder = await customerOrderModel.create({
        customerId,
        order_products: customerOrderProducts,
        order_price: price + shippingFee + tax,
        payment_status: "pending",
        shipping_details: shippingDetails,
        delivery_status: "pending_payment",
        itemCount,
        order_date: orderTime,
      });

      // The seller/vendor and admin view the order per seller.
      // Loop over the orderProducts array, which groups products by their seller.
      // Add the sellerPrice - Total price per seller, and the sellerId to the adminOrderData array
      for (let i = 0; i < orderProducts.length; i++) {
        const sellerProducts = orderProducts[i].products_data;
        const sellerPrice = orderProducts[i].price;
        const sellerId = orderProducts[i].sellerId;

        let sellerOrder = [];

        for (let j = 0; j < sellerProducts.length; j++) {
          const product = sellerProducts[j].productInfo;
          product.quantity = sellerProducts[j].quantity;
          sellerOrder.push(product);
        }

        adminOrderData.push({
          orderId: customerOrder._id,
          sellerId,
          order_products: sellerOrder,
          order_price: sellerPrice,
          payment_status: "pending",
          shipping_details: "Darware Main Warehouse",
          delivery_status: "pending_payment",
          order_date: orderTime,
        });
      }

      await adminOrderModel.insertMany(adminOrderData);
      // console.log("Admin order data is:", adminOrderData);

      // When the order is successfully placed, remove the processed cartIds from the cart.
      for (let k = 0; k < cartIds.length; k++) {
        await cartModel.findByIdAndDelete(cartIds[k]);
      }

      setTimeout(() => {
        this.paymentCheck(customerOrder._id);
      }, 15000); // 15 seconds

      responseReturn(res, 200, {
        message: "Order placed successfully",
        orderId: customerOrder._id,
        customerOrder,
      });
      // const order = await customerOrderModel
      //   .findById(customerOrder._id)
      //   .populate("customerId");

      // responseReturn(res, 200, { order });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  create_payment = async (req, res) => {
    // console.log(req.body);
    const { totalPrice } = req.body;

    try {
      const payment = await this.stripe.paymentIntents.create({
        amount: totalPrice * 100,
        currency: "kes",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      console.log("Payment is: ", payment);
      // Response from Stripe:
      // Payment is:  {
      //   id: 'pi_3RIComQ6RIDGLuyf15ISnLpC',
      //   object: 'payment_intent',
      //   amount: 2997220,
      //   amount_capturable: 0,
      //   amount_details: { tip: {} },
      //   amount_received: 0,
      //   application: null,
      //   application_fee_amount: null,
      //   automatic_payment_methods: { allow_redirects: 'always', enabled: true },
      //   canceled_at: null,
      //   cancellation_reason: null,
      //   capture_method: 'automatic_async',
      //   client_secret: 'pi_3RIComQ6RIDGLuyf15ISnLpC_secret_oF9ZNgHFJBWthltDMcTTLkQx7',
      //   confirmation_method: 'automatic',
      //   created: 1745689632,
      //   currency: 'kes',
      //   customer: null,
      //   description: null,
      //   invoice: null,
      //   last_payment_error: null,
      //   latest_charge: null,
      //   livemode: false,
      //   metadata: {},
      //   next_action: null,
      //   on_behalf_of: null,
      //   payment_method: null,
      //   payment_method_configuration_details: { id: 'pmc_1RHEBmQ6RIDGLuyfBEVSXIbE', parent: null },
      //   payment_method_options: {
      //     card: {
      //       installments: null,
      //       mandate_options: null,
      //       network: null,
      //       request_three_d_secure: 'automatic'
      //     },
      //     link: { persistent_token: null }
      //   },
      //   payment_method_types: [ 'card', 'link' ],
      //   processing: null,
      //   receipt_email: null,
      //   review: null,
      //   setup_future_usage: null,
      //   shipping: null,
      //   source: null,
      //   statement_descriptor: null,
      //   statement_descriptor_suffix: null,
      //   status: 'requires_payment_method',
      //   transfer_data: null,
      //   transfer_group: null
      // }
      responseReturn(res, 200, { clientSecret: payment.client_secret });
    } catch (error) {
      console.log(error.message);
    }
  };
}

export default new orderControllers();
