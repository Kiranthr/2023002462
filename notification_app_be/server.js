const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());

const TOKEN = process.env.ACCESS_TOKEN;

app.get("/notifications", async (req, res) => {
    try {
        const response = await axios.get(
            "http://4.224.186.213/evaluation-service/notifications",
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        res.json(response.data);

    } catch (error) {

        console.log("API Error:");

        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }

        res.status(500).json({
            error: error.response?.data || error.message
        });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});