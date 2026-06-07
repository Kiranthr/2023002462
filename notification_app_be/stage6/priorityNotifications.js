const axios = require("axios");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrdGhlbmlwYUBnaXRhbS5pbiIsImV4cCI6MTc4MDgxNDI5OCwiaWF0IjoxNzgwODEzMzk4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZDhmZDJkNDEtOGM2NC00ODQxLTlmOTgtNWRiMDJhOTU4NWJlIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoidGhlbmlwYWxsaSBraXJhbiBrdW1hciIsInN1YiI6IjAyMGI2YzM0LTQyMzItNGYxYy1iNDU3LWIwNGU4MGIxOTFlZiJ9LCJlbWFpbCI6Imt0aGVuaXBhQGdpdGFtLmluIiwibmFtZSI6InRoZW5pcGFsbGkga2lyYW4ga3VtYXIiLCJyb2xsTm8iOiIyMDIzMDAyNDYyIiwiYWNjZXNzQ29kZSI6IndnS3RnWiIsImNsaWVudElEIjoiMDIwYjZjMzQtNDIzMi00ZjFjLWI0NTctYjA0ZTgwYjE5MWVmIiwiY2xpZW50U2VjcmV0IjoiQXlmbUdGdWFGdWNneWpxSyJ9.nXNix1Zth5BVbmC4bfPxblyVfnawMmj0KOLb-hc9ssg";

function getWeight(type) {
  if (type === "Placement") return 3;
  if (type === "Result") return 2;
  return 1;
}

function calculateScore(notification) {
  const ageMinutes =
    (Date.now() - new Date(notification.Timestamp).getTime()) /
    (1000 * 60);

  return getWeight(notification.Type) * 100 - ageMinutes;
}

async function getTopNotifications(n = 10) {
  try {
    const response = await axios.get(
      "http://4.224.186.213/evaluation-service/notifications",
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      }
    );

    const notifications = response.data.notifications;

    const topNotifications = notifications
      .map(notification => ({
        ...notification,
        score: calculateScore(notification)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, n);

    console.table(topNotifications);

  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}

getTopNotifications();