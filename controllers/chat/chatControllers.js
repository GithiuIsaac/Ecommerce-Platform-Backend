import moment from "moment";
import { responseReturn } from "../../utilities/response.js";
import sellerModel from "../../models/sellerModel.js";
import customerModel from "../../models/customerModel.js";
import sellerCustomerModel from "../../models/chat/sellerCustomerModel.js";

class chatControllers {
  // This method creates a relationship/connection between an existing seller and an existing customer in the sellerCustomerModel
  // linkSellerToCustomer
  add_customer = async (req, res) => {
    // console.log(req.body);
    const { sellerId, customerId } = req.body;

    // Get the seller data, and create a relationship between the seller and customer in the seller_customers table
    // When a new customer is created using the addCustomer method, the customerId will be stored
    // The customer's communication with a seller will be stored in the sellerIds array.
    try {
      // Check if the sellerId is present in the request, and if they are, retrieve the seller info
      if (sellerId !== "") {
        console.log("1. SellerId is present in the request:", sellerId);
        const seller = await sellerModel.findById(sellerId);
        console.log("2. Seller is: ", seller);

        // Retrieve the customer's data from the DB
        const customer = await customerModel.findById(customerId);
        console.log("3. Customer is: ", customer);

        // Check existing customer-sellers relationship
        // myId - customerId
        // myFriends - sellerIds

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

        if (!checkSeller) {
          console.log("5. No existing relationship - creating new one");
          // If the seller is not present in the sellerIds array, add the seller to the array
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

        if (!checkCustomer) {
          console.log("8. No existing relationship - creating new one");
          // If the customer is not present in the linkedUsers array, add the customer to the array
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
      }
    } catch (error) {
      console.log(error.message);
    }
  };
}

export default new chatControllers();
