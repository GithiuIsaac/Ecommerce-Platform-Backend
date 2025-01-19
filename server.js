import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = process.env.PORT;

// app.use with the ES6 import format, not the CommonJS one
app.use("/api", authRoutes);

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
  console.log(`Server running on port ${port}:`);
});
