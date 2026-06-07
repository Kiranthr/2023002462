import React, { useEffect, useState } from "react";

function App() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/notifications"
      );

      const data = await response.json();

      console.log(data);

      setNotifications(data.notifications || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getPriority = (type) => {
    if (type === "Placement") return 3;
    if (type === "Result") return 2;
    return 1;
  };

  const filteredNotifications =
    filter === "All"
      ? notifications
      : notifications.filter(
          (item) => item.Type === filter
        );

  const topNotifications = [...notifications]
    .sort(
      (a, b) =>
        getPriority(b.Type) -
        getPriority(a.Type)
    )
    .slice(0, 10);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "auto",
      }}
    >
      <h1>Student Notification Dashboard</h1>

      <h3>
        Total Notifications:
        {" "}
        {filteredNotifications.length}
      </h3>

      <select
        value={filter}
        onChange={(e) =>
          setFilter(e.target.value)
        }
        style={{
          padding: "8px",
          marginBottom: "20px",
        }}
      >
        <option>All</option>
        <option>Placement</option>
        <option>Result</option>
        <option>Event</option>
      </select>

      <hr />

      <h2>Top Priority Notifications</h2>

      {topNotifications.map((item) => (
        <div
          key={item.ID}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <strong>{item.Type}</strong>

          <p>{item.Message}</p>

          <small>{item.Timestamp}</small>
        </div>
      ))}

      <hr />

      <h2>All Notifications</h2>

      {filteredNotifications.map(
        (notification) => {
          const viewed =
            localStorage.getItem(
              notification.ID
            );

          return (
            <div
              key={notification.ID}
              onClick={() => {
                localStorage.setItem(
                  notification.ID,
                  "viewed"
                );

                window.location.reload();
              }}
              style={{
                border: "1px solid gray",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  backgroundColor:
                    viewed
                      ? "green"
                      : "red",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
              >
                {viewed
                  ? "Viewed"
                  : "New"}
              </span>

              <h3>
                {notification.Type}
              </h3>

              <p>
                {notification.Message}
              </p>

              <small>
                {notification.Timestamp}
              </small>
            </div>
          );
        }
      )}
    </div>
  );
}

export default App;