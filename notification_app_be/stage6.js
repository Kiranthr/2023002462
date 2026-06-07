function getPriority(type) {
  if (type === "Placement") return 3;
  if (type === "Result") return 2;
  return 1;
}

function getTopNotifications(notifications, n = 10) {

  return notifications
    .map((notification) => ({
      ...notification,
      score:
        getPriority(notification.Type) * 100000 +
        new Date(notification.Timestamp).getTime()
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);

}

module.exports = getTopNotifications;