import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/dashboard/categoryRoutes.js";
import productRoutes from "./routes/dashboard/productRoutes.js";
import sellerRoutes from "./routes/dashboard/sellerRoutes.js";
import homeRoutes from "./routes/home/homeRoutes.js";
import customerAuthRoutes from "./routes/home/customerAuthRoutes.js";
import cartRoutes from "./routes/home/cartRoutes.js";
import orderRoutes from "./routes/order/orderRoutes.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dbConnect from "./utilities/db.js";

const app = express();
const port = process.env.PORT;

dbConnect();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(cookieParser());

// app.use with the ES6 import format, not the CommonJS one
app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api", sellerRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/customer", customerAuthRoutes);

app.get("/", (req, res) => {
  res.send("This is the backend server");
});

app.get("/about", (req, res) => {
  res.send("<h1>About Me</h1><p>My name is Isaac Ndarwa</p>");
});

app.get("/contact", (req, res) => {
  res.send("<h1>Contact Me</h1><p>Phone: +254123456789</p>");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
