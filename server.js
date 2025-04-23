const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs"); // Deprecated, consider using bcryptjs or bcrypt
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const register = require("./Controllers/register");
const signin = require("./Controllers/signin");
const profile = require("./Controllers/profile");
const image = require("./Controllers/image");

knex
  .raw("SELECT 1")
  .then(() => console.log("✅ Connected to the database!"))
  .catch((err) => console.error("❌ Database connection failed:", err));

const corsOptions = {
  origin: [
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
  optionsSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  const users = await knex.select("*").from("users");
  res.json(users);
});

app.post("/signin", (req, res) => {
  signin.handleSignin(req, res, knex, bcrypt);
});

app.post("/register", (req, res) => {
  register.handleRegister(res, req, knex, bcrypt);
});

app.get("/profile/:id", (req, res) => {
  profile.handleProfile(req, res, knex);
});

app.put("/image", (req, res) => {
  image.handleImage(req, res, knex);
});

app.post("/imageurl", async (req, res) => {
  const { input } = req.body;

  const raw = JSON.stringify({
    user_app_id: {
      user_id: process.env.CLARIFAI_USER_ID,
      app_id: process.env.CLARIFAI_APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: input,
          },
        },
      },
    ],
  });

  try {
    const clarifaiRes = await fetch(
      "https://api.clarifai.com/v2/models/face-detection/versions/6dc7e46bc9124c5c8824be4822abe105/outputs",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Key ${process.env.CLARIFAI_PAT}`,
          "Content-Type": "application/json",
        },
        body: raw,
      }
    );

    const data = await clarifaiRes.json();
    res.json(data);
  } catch (err) {
    console.error("Clarifai API error:", err);
    res.status(400).json("Unable to work with API");
  }
});

app.listen(3001, () => {
  console.log("App is running on port 3001");
});
