import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { socket } from "../../services/socket";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const [ordersData, menuData] =
          await Promise.all([
            api.getAllOrders(),
            api.getMenu(),
          ]);

        if (mounted) {
          setOrders(ordersData);
          setMenuItems(menuData);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    socket.connect();

    const handleNewOrder = (order) => {
      setOrders((currentOrders) => {
        const exists = currentOrders.some(
          (currentOrder) =>
            currentOrder._id === order._id
        );

        if (exists) {
          return currentOrders;
        }

        return [order, ...currentOrders];
      });
    };

    const handleOrderPaid = (order) => {
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id
            ? order
            : currentOrder
        )
      );
    };

    socket.on(
      "newOrder",
      handleNewOrder
    );

    socket.on(
      "orderPaid",
      handleOrderPaid
    );

    return () => {
      mounted = false;

      socket.off(
        "newOrder",
        handleNewOrder
      );

      socket.off(
        "orderPaid",
        handleOrderPaid
      );

      socket.disconnect();
    };
  }, []);

  const totalOrders = orders.length;

  const incomingOrders = orders.filter(
    (order) =>
      order.orderStatus === "Incoming"
  ).length;

  const preparingOrders = orders.filter(
    (order) =>
      order.orderStatus === "Preparing"
  ).length;

  const paidOrders = orders.filter(
    (order) =>
      order.paymentStatus === "Paid"
  ).length;

  const totalRevenue = orders
    .filter(
      (order) =>
        order.paymentStatus === "Paid"
    )
    .reduce(
      (total, order) =>
        total + Number(order.totalPrice),
      0
    );

  const availableMenuItems =
    menuItems.filter(
      (item) => item.isAvailable
    ).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            DAN RESTAURANT
          </p>

          <h1>Dashboard</h1>

          <span>
            Here's what's happening with
            your restaurant.
          </span>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <span>Total Orders</span>

              <strong>
                {totalOrders}
              </strong>

              <small>
                All customer orders
              </small>
            </div>

            <div className="dashboard-stat">
              <span>Incoming</span>

              <strong>
                {incomingOrders}
              </strong>

              <small>
                Waiting to be prepared
              </small>
            </div>

            <div className="dashboard-stat">
              <span>Preparing</span>

              <strong>
                {preparingOrders}
              </strong>

              <small>
                Currently being prepared
              </small>
            </div>

            <div className="dashboard-stat">
              <span>Paid Orders</span>

              <strong>
                {paidOrders}
              </strong>

              <small>
                Successfully paid
              </small>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p>REVENUE</p>

                  <h2>
                    ₦
                    {totalRevenue.toLocaleString()}
                  </h2>
                </div>

                <span className="dashboard-panel-icon">
                  ₦
                </span>
              </div>

              <p className="dashboard-panel-description">
                Total revenue from
                successfully paid orders.
              </p>
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <p>MENU</p>

                  <h2>
                    {availableMenuItems}
                  </h2>
                </div>

                <span className="dashboard-panel-icon">
                  ✓
                </span>
              </div>

              <p className="dashboard-panel-description">
                Menu items currently
                available for customers.
              </p>
            </div>
          </div>

          <div className="dashboard-recent">
            <div className="dashboard-recent-header">
              <div>
                <p>RECENT ACTIVITY</p>

                <h2>Latest Orders</h2>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="dashboard-empty">
                No orders yet.
              </div>
            ) : (
              <div className="dashboard-order-list">
                {orders
                  .slice(0, 5)
                  .map((order) => (
                    <div
                      className="dashboard-order-row"
                      key={order._id}
                    >
                      <div>
                        <strong>
                          #
                          {order._id
                            .slice(-6)
                            .toUpperCase()}
                        </strong>

                        <span>
                          {order.guestName}
                        </span>
                      </div>

                      <span
                        className={`dashboard-status ${order.orderStatus
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )}`}
                      >
                        {order.orderStatus}
                      </span>

                      <strong>
                        ₦
                        {Number(
                          order.totalPrice
                        ).toLocaleString()}
                      </strong>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;