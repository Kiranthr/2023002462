const data = require("./notifications.json");

const getTopNotifications =
require("./stage6");

const result =
getTopNotifications(
  data.notifications
);

console.log(result);