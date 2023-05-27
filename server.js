import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, "public")));

// MongoDB connection URL
const url = process.env.MONGODB_URL;

// Database and collection names
const collectionName = "responses";

// Define the schema for the form response
const responseSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  dob: Date,
  age: Number,
});

// Create a model based on the schema
const Response = mongoose.model("Response", responseSchema);

// Route to handle form submissions
app.post("/submit", (req, res) => {
  // Extract form data
  const { firstname, lastname, email, dob, age } = req.body;

  // Create a new response document
  const response = new Response({
    firstname,
    lastname,
    email,
    dob,
    age,
  });

  // Save the response document to the database
  response
    .save()
    .then(() => {
      console.log("Response saved successfully");
      res.sendFile(join(__dirname, "public", "submit.html"));
    })
    .catch((err) => {
      console.error("Failed to save response:", err);
      res.sendStatus(500);
    });
});

// Serve the form page
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public", "form.html"));
});

// Serve the response data as HTML
app.get("/responses", async (req, res) => {
  try {
    // Retrieve the responses from the database using Mongoose
    const responses = await Response.find({});

    // Generate HTML for the responses
    let html = "<h1>Responses:</h1>";
    responses.forEach((response) => {
      html += `<p>First Name: ${response.firstname}</p>`;
      html += `<p>Last Name: ${response.lastname}</p>`;
      html += `<p>Email: ${response.email}</p>`;
      html += `<p>Date of Birth: ${response.dob}</p>`;
      html += `<p>Age: ${response.age}</p>`;
      html += "<hr>";
    });

    // Send the HTML response
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// Connect to MongoDB Atlas
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("Connected to MongoDB Atlas");
    // Start the server after successful database connection
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB Atlas:", err);
  });
