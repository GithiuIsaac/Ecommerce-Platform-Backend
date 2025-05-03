import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/dashboard/categoryRoutes.js";
import productRoutes from "./routes/dashboard/productRoutes.js";
import sellerRoutes from "./routes/dashboard/sellerRoutes.js";
import customerDashboardRoutes from "./routes/dashboard/customerRoutes.js";
import chatRoutes from "./routes/chat/chatRoutes.js";
import homeRoutes from "./routes/home/homeRoutes.js";
import customerAuthRoutes from "./routes/home/customerAuthRoutes.js";
import dashboardRoutes from "./routes/dashboard/dashboardRoutes.js";
import paymentRoutes from "./routes/payment/paymentRoutes.js";
import cartRoutes from "./routes/home/cartRoutes.js";
import orderRoutes from "./routes/order/orderRoutes.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dbConnect from "./utilities/db.js";
import { Server } from "socket.io";
import http from "http";

const app = express();
const port = process.env.PORT;

dbConnect();

const server = http.createServer(app);
app.use(
  cors({
    // origin: ["http://localhost:5173", "http://localhost:3001"],
    origin:
      process.env.mode === "production"
        ? [
            process.env.client_customer_production_url,
            process.env.client_admin_production_url,
          ]
        : ["http://localhost:5173", "http://localhost:3001"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    // origin: "*",
    origin:
      process.env.mode === "production"
        ? [
            process.env.client_customer_production_url,
            process.env.client_admin_production_url,
          ]
        : ["http://localhost:5173", "http://localhost:3001"],
    credentials: true,
  },
});

var allCustomers = [];
var allSellers = [];
var admin = {};

function linkUsers(customerId, socketId, customerInfo) {
  const checkCustomer = allCustomers.some(
    (customer) => customer.customerId === customerId
  );
  if (!checkCustomer) {
    allCustomers.push({ customerId, socketId, customerInfo });
  }
  // !allCustomers.some((customer) => customer.customerId === customerId) &&
  //   allCustomers.push({ customerId, socketId, customerInfo });
}

function addSeller(sellerId, socketId, userInfo) {
  const checkSeller = allSellers.some((seller) => seller.sellerId === sellerId);
  if (!checkSeller) {
    allSellers.push({ sellerId, socketId, userInfo });
  }
}

function findCustomer(customerId) {
  return allCustomers.find((customer) => customer.customerId === customerId);
}

function findSeller(sellerId) {
  return allSellers.find((seller) => seller.sellerId === sellerId);
}

function remove(socketId) {
  allCustomers = allCustomers.filter(
    (customer) => customer.socketId !== socketId
  );
  allSellers = allSellers.filter((seller) => seller.socketId !== socketId);
}

io.on("connection", (socket) => {
  // console.log("User connected");
  console.log("Socket server running...");

  // Add customer
  socket.on("link_users", (customerId, customerInfo) => {
    linkUsers(customerId, socket.id, customerInfo);
    io.emit("active_sellers", allSellers);
  });

  // Add seller
  socket.on("add_seller", (sellerId, userInfo) => {
    // console.log("Seller added: ", userInfo);
    addSeller(sellerId, socket.id, userInfo);
    io.emit("active_sellers", allSellers);
  });

  socket.on("send_seller_message", (message) => {
    // console.log(message);
    // Pass this message to the appropriate customer, who is identified by the receiverId
    const customer = findCustomer(message.receiverId);
    // console.log("Customer: ", customer);

    if (customer !== undefined) {
      socket.to(customer.socketId).emit("receive_seller_message", message);
      // receive_seller_message is called from the seller chat dashboard
    }
  });

  socket.on("send_customer_message", (message) => {
    // console.log(message);
    // Pass this message to the appropriate seller, who is identified by the receiverId
    const seller = findSeller(message.receiverId);
    // console.log("Seller: ", seller);

    if (seller !== undefined) {
      socket.to(seller.socketId).emit("receive_customer_message", message);
    }
  });

  socket.on("send_admin_message", (message) => {
    // console.log(message);
    // Pass this message to the appropriate seller, who is identified by the receiverId
    const seller = findSeller(message.receiverId);
    // console.log("seller: ", seller);

    if (seller !== undefined) {
      socket.to(seller.socketId).emit("receive_admin_message", message);
      // receive_seller_message is called from the seller admin chat dashboard
    }
  });

  socket.on("send_seller_to_admin_message", (message) => {
    // No recipient information necessary, since the admin is the only recipient
    if (admin.socketId) {
      socket.to(admin.socketId).emit("receive_seller_message", message);
      // receive_seller_message is called from the seller admin chat dashboard
    }
  });

  // Add admin
  socket.on("add_admin", (adminInfo) => {
    // Create a new admin object with the spread operator
    admin = {
      ...adminInfo,
      socketId: socket.id,
    };
    // Remove sensitive data
    delete admin.email;
    delete admin.password;
    console.log("Admin object: ", admin);

    io.emit("active_sellers", allSellers);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    remove(socket.id);
    io.emit("active_sellers", allSellers);
    io.emit("active_customers", allCustomers);
  });
});

app.use(bodyParser.json());
app.use(cookieParser());

// app.use with the ES6 import format, not the CommonJS one
app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api", sellerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/customer", customerAuthRoutes);
app.use("/api/dashboard", customerDashboardRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("This is the backend server");
});

app.get("/about", (req, res) => {
  res.send("<h1>About Me</h1><p>My name is Isaac Ndarwa</p>");
});

app.get("/contact", (req, res) => {
  res.send("<h1>Contact Me</h1><p>Phone: +254123456789</p>");
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
