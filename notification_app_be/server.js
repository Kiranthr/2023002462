const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrdGhlbmlwYUBnaXRhbS5pbiIsImV4cCI6MTc4MDgxNjkyOCwiaWF0IjoxNzgwODE2MDI4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZGNiNzA3NjQtMDhmOC00ZmI1LWFhMWUtYjczMWNlM2U2M2VhIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoidGhlbmlwYWxsaSBraXJhbiBrdW1hciIsInN1YiI6IjAyMGI2YzM0LTQyMzItNGYxYy1iNDU3LWIwNGU4MGIxOTFlZiJ9LCJlbWFpbCI6Imt0aGVuaXBhQGdpdGFtLmluIiwibmFtZSI6InRoZW5pcGFsbGkga2lyYW4ga3VtYXIiLCJyb2xsTm8iOiIyMDIzMDAyNDYyIiwiYWNjZXNzQ29kZSI6IndnS3RnWiIsImNsaWVudElEIjoiMDIwYjZjMzQtNDIzMi00ZjFjLWI0NTctYjA0ZTgwYjE5MWVmIiwiY2xpZW50U2VjcmV0IjoiQXlmbUdGdWFGdWNneWpxSyJ9.Mo_f4OTSco0tUtVb_ErtATszhgFYMTASncmzYgHQlWw";

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