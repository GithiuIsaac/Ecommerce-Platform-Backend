import moment from "moment";
import { responseReturn } from "../../utilities/response.js";
import sellerModel from "../../models/sellerModel.js";
import customerModel from "../../models/customerModel.js";
import sellerCustomerModel from "../../models/chat/sellerCustomerModel.js";
import sellerCustomerMsgModel from "../../models/chat/sellerCustomerMessages.js";

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
        console.log("1. SellerId is present in the request:", sellerId);
        const seller = await sellerModel.findById(sellerId);
        console.log("2. Seller is: ", seller);

        // Retrieve the customer's data from the DB
        const customer = await customerModel.findById(customerId);
        console.log("3. Customer is: ", customer);

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
        console.log("4. Existing relationship check result:", checkSeller);

        // Create customer->seller relationship if it doesn't exist
        if (!checkSeller) {
          console.log("5. No existing relationship - creating new one");
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
          console.log("6. Update result:", updateResult);
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
        console.log("7. Existing relationship check result:", checkCustomer);

        // Create seller->customer relationship if it doesn't exist
        if (!checkCustomer) {
          console.log("8. No existing relationship - creating new one");
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
          console.log("9. Update result:", updateResult);
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
        console.log("10. Retrieved messages:", messages.length);

        // Get all sellers linked to this customer
        // The customer should be able to view their existing chats with sellers, and the sellers are listed on the Chat dashboard page.
        const linkedSellers = await sellerCustomerModel.findOne({
          userId: customerId,
        });
        console.log("11. Linked sellers data:", linkedSellers);

        // Return the current selected seller chat/communication
        const currentSeller = linkedSellers.linkedUsers.find(
          (seller) => seller.userId === sellerId
        );
        console.log("12. Current seller details:", currentSeller);

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
        console.log(
          "14. No sellerId provided - returning only linked sellers:",
          linkedSellers?.linkedUsers?.length
        );
        responseReturn(res, 200, {
          linkedSellers: linkedSellers.linkedUsers,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
}

export default new chatControllers();
