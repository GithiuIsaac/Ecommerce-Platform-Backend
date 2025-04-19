import moment from "moment";
import { responseReturn } from "../../utilities/response.js";
import sellerModel from "../../models/sellerModel.js";
import customerModel from "../../models/customerModel.js";
import sellerCustomerModel from "../../models/chat/sellerCustomerModel.js";
import sellerCustomerMsgModel from "../../models/chat/sellerCustomerMessages.js";
import adminSellerMsgModel from "../../models/chat/adminSellerMessages.js";

class chatControllers {
  // This method creates a bi-directional relationship/connection between an existing seller and an existing customer in the sellerCustomerModel
  link_users = async (req, res) => {
    const { sellerId, customerId } = req.body;

    // Get the seller data, and create a relationship between the seller and customer in the seller_customers table
    // When a new customer is created using the addCustomer method, the customerId will be stored
    // The customer's communication with a seller will be stored in the sellerIds array.
    try {
      // Check if the sellerId is present in the request, and if they are, retrieve the seller info
      // Only proceed if sellerId is provided
      if (sellerId !== "") {
        // Retrieves both seller and customer information from their respective models
        // console.log("1. SellerId is present in the request:", sellerId);
        const seller = await sellerModel.findById(sellerId);
        // console.log("2. Seller is: ", seller);

        // Retrieve the customer's data from the DB
        const customer = await customerModel.findById(customerId);
        // console.log("3. Customer is: ", customer);

        // Check existing customer-sellers relationship
        // myId - customerId
        // myFriends - sellerIds
        // Checks if the customer already has a relationship with this seller
        const checkSeller = await sellerCustomerModel.findOne({
          $and: [
            {
              userId: {
                $eq: customerId,
              },
            },
            {
              linkedUsers: {
                // $in: [sellerId],
                $elemMatch: {
                  userId: sellerId,
                },
              },
            },
          ],
        });
        // console.log("4. Existing relationship check result:", checkSeller);

        // Create customer->seller relationship if it doesn't exist
        if (!checkSeller) {
          // console.log("5. No existing relationship - creating new one");
          // If no relationship exists with this seller, create one, and store the seller's details in the customer's linkedUsers array
          const updateResult = await sellerCustomerModel.updateOne(
            { userId: customerId, userType: "customer" },
            {
              $push: {
                linkedUsers: {
                  userId: sellerId,
                  name: seller.sellerInfo?.seller_name,
                  image: seller.image,
                  userType: "seller",
                },
              },
            },
            { upsert: true }
            // Update the document if it exists, Create a new document if it doesn't exist
            // Without upsert: true, the updateOne operation would just fail silently when trying to update a non-existent document
            // With upsert: true, the updateOne operation will create a new document if it doesn't exist
          );
          // console.log("6. Update result:", updateResult);
        }

        // Check existing seller-customers relationship
        // myId - sellerId
        // myFriends - customerIds
        // Checks if the seller already has a relationship with this customer
        const checkCustomer = await sellerCustomerModel.findOne({
          $and: [
            {
              userId: {
                $eq: sellerId,
              },
            },
            {
              linkedUsers: {
                // $in: [sellerId],
                $elemMatch: {
                  userId: customerId,
                },
              },
            },
          ],
        });
        // console.log("7. Existing relationship check result:", checkCustomer);

        // Create seller->customer relationship if it doesn't exist
        if (!checkCustomer) {
          // console.log("8. No existing relationship - creating new one");
          // If no relationship exists with this customer, create one, and store the customer's details in the seller's linkedUsers array
          const updateResult = await sellerCustomerModel.updateOne(
            { userId: sellerId, userType: "seller" },
            {
              $push: {
                linkedUsers: {
                  userId: customerId,
                  name: customer.name,
                  image: "",
                  userType: "customer",
                },
              },
            },
            { upsert: true }
            // Update the document if it exists, Create a new document if it doesn't exist
            // Without upsert: true, the updateOne operation would just fail silently when trying to update a non-existent document
            // With upsert: true, the updateOne operation will create a new document if it doesn't exist
          );
          // console.log("9. Update result:", updateResult);
        }
        // When the request is sent from the chat dashboard, check that the receiverId is the appropriate sellerId, or if the receivedId is the customerId
        // Two-way communication, customer -> seller, and seller -> customer
        // Retrieves existing messages between the seller and customer
        const messages = await sellerCustomerMsgModel.find({
          $or: [
            {
              $and: [
                {
                  receiverId: { $eq: sellerId },
                },
                {
                  senderId: { $eq: customerId },
                },
              ],
            },
            {
              $and: [
                {
                  receiverId: { $eq: customerId },
                },
                {
                  senderId: { $eq: sellerId },
                },
              ],
            },
          ],
        });
        // console.log("10. Retrieved messages:", messages.length);

        // Get all sellers linked to this customer
        // The customer should be able to view their existing chats with sellers, and the sellers are listed on the Chat dashboard page.
        const linkedSellers = await sellerCustomerModel.findOne({
          userId: customerId,
        });
        // console.log("11. Linked sellers data:", linkedSellers);

        // Return the current selected seller chat/communication
        const currentSeller = linkedSellers.linkedUsers.find(
          (seller) => seller.userId === sellerId
        );
        // console.log("12. Current seller details:", currentSeller);

        responseReturn(res, 200, {
          linkedSellers: linkedSellers.linkedUsers,
          currentSeller,
          messages,
        });
      } else {
        // When sellerId is empty
        const linkedSellers = await sellerCustomerModel.findOne({
          userId: customerId,
        });
        // console.log(
        //   "14. No sellerId provided - returning only linked sellers:",
        //   linkedSellers?.linkedUsers?.length
        // );
        responseReturn(res, 200, {
          linkedSellers: linkedSellers.linkedUsers,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // The send_customer_message function handles sending a customer message to a seller
  send_customer_message = async (req, res) => {
    const { customerId, customerName, msg, sellerId, sellerName } = req.body;
    // console.log(req.body);

    try {
      const message = await sellerCustomerMsgModel.create({
        senderId: customerId,
        senderName: customerName,
        message: msg,
        receiverId: sellerId,
        receiverName: sellerName,
      });

      // Customer's View
      // Index the seller data
      // Retrieve the sellers linked to this customer
      // The last conversation should be in the top position.
      const sellerData = await sellerCustomerModel.findOne({
        userId: customerId,
      });
      let linkedSellers = sellerData.linkedUsers;
      let sellerIndex = linkedSellers.findIndex(
        (seller) => seller.userId === sellerId
      );

      while (sellerIndex > 0) {
        let temp = linkedSellers[sellerIndex];
        linkedSellers[sellerIndex] = linkedSellers[sellerIndex - 1];
        linkedSellers[sellerIndex - 1] = temp;
        sellerIndex--;
      }

      await sellerCustomerModel.updateOne(
        { userId: customerId },
        { linkedUsers: linkedSellers }
      );

      // Seller's View
      // Index the customer data
      // Retrieve the customers linked to this seller
      // The last conversation should be in the top position.
      const customerData = await sellerCustomerModel.findOne({
        userId: sellerId,
      });
      let linkedCustomers = customerData.linkedUsers;
      let customerIndex = linkedCustomers.findIndex(
        (customer) => customer.userId === customerId
      );

      while (customerIndex > 0) {
        let temp = linkedCustomers[customerIndex];
        linkedCustomers[customerIndex] = linkedCustomers[customerIndex - 1];
        linkedCustomers[customerIndex - 1] = temp;
        customerIndex--;
      }

      await sellerCustomerModel.updateOne(
        { userId: sellerId },
        { linkedUsers: linkedCustomers }
      );

      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error.message);
    }
  };

  // The get_customers function retrieves all the customers associated with a particular seller
  get_customers = async (req, res) => {
    // console.log(req.params);
    const { sellerId } = req.params;
    try {
      // Retrieve the customers linked to this seller
      const customerData = await sellerCustomerModel.findOne({
        userId: sellerId,
      });
      responseReturn(res, 200, {
        // customers: customerData.linkedUsers,
        linkedCustomers: customerData.linkedUsers,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // The get_customer_messages function retrieves all the messages associated with a particular seller and customer
  get_customer_messages = async (req, res) => {
    // console.log(req.params);
    const { customerId } = req.params;
    // console.log(req);
    // sellerId
    const { id } = req;

    try {
      // Two-way communication, customer -> seller, and seller -> customer
      // This query retrieves two-way conversations between a seller and a customer
      // - Messages sent from seller to customer
      // - Messages sent from customer to seller
      const messages = await sellerCustomerMsgModel.find({
        // $or matches either of two conditions, Returns an array of all messages that match either condition
        $or: [
          // First condition: Messages FROM seller TO customer, Seller → Customer
          // Finds messages where the seller is the sender and the customer is the receiver
          {
            $and: [
              {
                receiverId: { $eq: customerId },
                // Message received by customer
              },
              {
                senderId: { $eq: id },
                // Message sent by seller
              },
            ],
          },
          // Second condition: Messages FROM customer TO seller, Customer → Seller
          // Finds messages where the customer is the sender and the seller is the receiver
          {
            $and: [
              {
                receiverId: { $eq: id },
                // Message received by seller
              },
              {
                senderId: { $eq: customerId },
                // Message sent by customer
              },
            ],
          },
        ],
      });
      // console.log("Retrieved messages:", messages.length);

      // The customers linked to this seller are already retrieved by the get_customers method, and displayed on the seller chat dashboard.
      // To get the current customer:
      const currentCustomer = await customerModel.findById(customerId);
      // console.log("Current customer details:", currentCustomer);

      responseReturn(res, 200, {
        currentCustomer,
        messages,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // The send_seller_message function handles sending a seller message to a customer
  send_seller_message = async (req, res) => {
    const { customerId, customerName, msg, sellerId, sellerName } = req.body;
    // console.log(req.body);

    try {
      const message = await sellerCustomerMsgModel.create({
        // Seller is the sender
        senderId: sellerId,
        senderName: sellerName,
        message: msg,
        receiverId: customerId,
        receiverName: customerName,
        // Customer is the receiver
      });

      // Seller's View (Sender)
      // Index the customer data
      // Retrieve the customers linked to this seller
      // The last conversation should be in the top position.
      const customerData = await sellerCustomerModel.findOne({
        userId: sellerId,
      });
      let linkedCustomers = customerData.linkedUsers;
      let customerIndex = linkedCustomers.findIndex(
        (customer) => customer.userId === customerId
      );

      while (customerIndex > 0) {
        let temp = linkedCustomers[customerIndex];
        linkedCustomers[customerIndex] = linkedCustomers[customerIndex - 1];
        linkedCustomers[customerIndex - 1] = temp;
        customerIndex--;
      }

      await sellerCustomerModel.updateOne(
        { userId: sellerId },
        { linkedUsers: linkedCustomers }
      );

      // Customer's View (Receiver)
      // Index the seller data
      // Retrieve the sellers linked to this customer
      // The last conversation should be in the top position.
      const sellerData = await sellerCustomerModel.findOne({
        userId: customerId,
      });
      let linkedSellers = sellerData.linkedUsers;
      let sellerIndex = linkedSellers.findIndex(
        (seller) => seller.userId === sellerId
      );

      while (sellerIndex > 0) {
        let temp = linkedSellers[sellerIndex];
        linkedSellers[sellerIndex] = linkedSellers[sellerIndex - 1];
        linkedSellers[sellerIndex - 1] = temp;
        sellerIndex--;
      }

      await sellerCustomerModel.updateOne(
        { userId: customerId },
        { linkedUsers: linkedSellers }
      );

      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error.message);
    }
  };

  // Admin <-> Seller chat
  // The get_sellers function retrieves all the sellers
  get_sellers = async (req, res) => {
    try {
      // Retrieve all seller from the seller table
      const sellers = await sellerModel.find();
      responseReturn(res, 200, {
        sellers,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // The send_admin_message function handles sending a message from the admin to a seller
  send_admin_message = async (req, res) => {
    const { senderId, msg, receiverId, senderName, receiverName } = req.body;

    try {
      const message = await adminSellerMsgModel.create({
        senderId: senderId,
        senderName: senderName,
        message: msg,
        receiverId: receiverId,
        receiverName: receiverName,
      });
      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error.message);
    }
  };

  // The get_admin_messages function retrieves all the messages associated with a particular seller and admin
  get_admin_messages = async (req, res) => {
    const { receiverId } = req.params;
    // console.log("Receiver Id: ", receiverId);
    // admin - can be receiver or sender
    const id = "";

    try {
      // Two-way communication, admin -> seller, and seller -> admin
      // This query retrieves two-way conversations between an admin and a seller
      // - Messages sent from admin to seller
      // - Messages sent from seller to admin
      const messages = await adminSellerMsgModel.find({
        // $or matches either of two conditions, Returns an array of all messages that match either condition
        $or: [
          // First condition: Messages FROM admin TO seller, Admin → Seller
          // Finds messages where the admin is the sender and the seller is the receiver
          {
            $and: [
              {
                receiverId: { $eq: receiverId },
                // Message received by seller
              },
              {
                senderId: { $eq: id },
                // Message sent by admin
              },
            ],
          },
          // Second condition: Messages FROM seller TO admin, Seller → Admin
          // Finds messages where the seller is the sender and the admin is the receiver
          {
            $and: [
              {
                receiverId: { $eq: id },
                // Message received by admin
              },
              {
                senderId: { $eq: receiverId },
                // Message sent by seller
              },
            ],
          },
        ],
      });

      // The sellers are already retrieved by the get_sellers method, and displayed on the admin chat dashboard.
      // To get the current seller, only if the receiverId is present - This means that the method is being called by the admin :
      var currentSeller = {};
      if (receiverId) {
        currentSeller = await sellerModel.findById(receiverId);
      }
      responseReturn(res, 200, {
        currentSeller,
        sellerAdminMessages: messages,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // The get_seller_messages function retrieves all the messages associated with a particular seller and admin
  get_seller_messages = async (req, res) => {
    // ReceiverId is the admin
    const receiverId = "";
    // seller is the sender
    const { id } = req;

    try {
      // Two-way communication, admin -> seller, and seller -> admin
      // This query retrieves two-way conversations between an admin and a seller
      // - Messages sent from admin to seller
      // - Messages sent from seller to admin
      const messages = await adminSellerMsgModel.find({
        // $or matches either of two conditions, Returns an array of all messages that match either condition
        $or: [
          // First condition: Messages FROM seller TO admin, Seller → Admin
          // Finds messages where the seller is the sender and the admin is the receiver

          {
            $and: [
              {
                receiverId: { $eq: receiverId },

                // Message received by admin
              },
              {
                senderId: { $eq: id },
                // Message sent by seller
              },
            ],
          },
          // Second condition: Messages FROM admin TO seller, Admin → Seller
          // Finds messages where the admin is the sender and the seller is the receiver
          {
            $and: [
              {
                receiverId: { $eq: id },
                // Message received by seller
              },
              {
                senderId: { $eq: receiverId },

                // Message sent by admin
              },
            ],
          },
        ],
      });

      responseReturn(res, 200, {
        sellerAdminMessages: messages,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
}

export default new chatControllers();
