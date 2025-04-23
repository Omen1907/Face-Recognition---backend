const fetch = require("node-fetch");
require("dotenv").config(); // make sure this is at the top

const handleApiCall = async (req, res) => {
  const { input } = req.body;

  const PAT = process.env.CLARIFAI_PAT;
  const USER_ID = process.env.CLARIFAI_USER_ID;
  const APP_ID = process.env.CLARIFAI_APP_ID;
  const MODEL_ID = "face-detection";
  const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
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

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Key ${PAT}`,
      "Content-Type": "application/json",
    },
    body: raw,
  };

  try {
    const clarifaiRes = await fetch(
      `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
      requestOptions
    );
    const data = await clarifaiRes.json();
    res.json(data);
  } catch (err) {
    console.error("Clarifai API call failed:", err);
    res.status(500).json({
      message: "Unable to work with API",
      error: err.message || err,
    });
  }
};

module.exports = {
  handleApiCall,
};
