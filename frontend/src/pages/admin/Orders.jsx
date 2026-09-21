import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { socket } from "../../services/socket";
import "./Orders.css";

const ORDER_STATUSES = [
  "Incoming",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        const data = await api.getAllOrders();

        if (mounted) {
          setOrders(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Load orders error:", error);

        if (mounted) {
          setError(
            error.message || "Failed to load orders."
          );
          setLoading(false);
        }
      }
    };

    loadOrders();

    socket.connect();

    const handleNewOrder = (newOrder) => {
      setOrders((currentOrders) => {
        const exists = currentOrders.some(
          (order) => order._id === newOrder._id
        );

        if (exists) {
          return currentOrders;
        }

        return [newOrder, ...currentOrders];
      });
    };

    const handleOrderPaid = (paidOrder) => {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === paidOrder._id
            ? paidOrder
            : order
        )
      );
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("orderPaid", handleOrderPaid);

    return () => {
      mounted = false;

      socket.off("newOrder", handleNewOrder);
      socket.off("orderPaid", handleOrderPaid);
      socket.disconnect();
    };
  }, []);

  const handleStatusChange = async (
    orderId,
    status
  ) => {
    try {
      setUpdatingOrder(orderId);

      const updatedOrder =
        await api.updateOrderStatus(
          orderId,
          status
        );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? updatedOrder
            : order
        )
      );
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      alert(
        error.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <p className="orders-eyebrow">
            RESTAURANT ORDERS
          </p>

          <h1>Orders</h1>

          <span>
            View and manage customer orders in
            real time.
          </span>
        </div>

        <div className="orders-count">
          {orders.length}{" "}
          {orders.length === 1
            ? "Order"
            : "Orders"}
        </div>
      </div>

      {loading && (
        <div className="orders-message">
          Loading orders...
        </div>
      )}

      {!loading && error && (
        <div className="orders-message orders-error">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        orders.length === 0 && (
          <div className="orders-message">
            No orders have been placed yet.
          </div>
        )}

      {!loading &&
        !error &&
        orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article
                className="order-card"
                key={order._id}
              >
                <div className="order-card-header">
                  <div>
                    <span className="order-label">
                      ORDER
                    </span>

                    <h2>
                      #
                      {order._id
                        .slice(-6)
                        .toUpperCase()}
                    </h2>
                  </div>

                  <div className="order-badges">
                    <span
                      className={`order-status ${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>

                    <span
                      className={`payment-status ${
                        order.paymentStatus ===
                        "Paid"
                          ? "paid"
                          : ""
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-customer">
                    <h3>Customer</h3>

                    <p>
                      <strong>
                        {order.guestName}
                      </strong>
                    </p>

                    <p>
                      {order.guestEmail}
                    </p>

                    <p>
                      {order.guestPhone}
                    </p>
                  </div>

                  <div className="order-delivery">
                    <h3>
                      Delivery Address
                    </h3>

                    <p>
                      {order.deliveryAddress}
                    </p>
                  </div>

                  <div className="order-items">
                    <h3>Items</h3>

                    {order.items.map(
                      (item, index) => (
                        <div
                          className="order-item"
                          key={`${order._id}-${index}`}
                        >
                          <span>
                            {item.quantity} ×{" "}
                            {item.name}
                          </span>

                          <strong>
                            ₦
                            {(
                              Number(item.price) *
                              item.quantity
                            ).toLocaleString()}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="order-card-footer">
                  <div>
                    <span>Total</span>

                    <strong>
                      ₦
                      {Number(
                        order.totalPrice
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div className="order-status-control">
                    <label
                      htmlFor={`status-${order._id}`}
                    >
                      Update Status
                    </label>

                    <select
                      id={`status-${order._id}`}
                      value={order.orderStatus}
                      disabled={
                        updatingOrder ===
                        order._id
                      }
                      onChange={(event) =>
                        handleStatusChange(
                          order._id,
                          event.target.value
                        )
                      }
                    >
                      {ORDER_STATUSES.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
    </div>
  );
}

export default Orders;