import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { socket } from "../services/socket";
import "./TrackOrder.css";

const STATUS_STEPS = [
  {
    key: "Incoming",
    title: "Order Received",
    description: "Your order has been received by the restaurant.",
  },
  {
    key: "Preparing",
    title: "Preparing",
    description: "The kitchen is preparing your meal.",
  },
  {
    key: "Ready",
    title: "Ready",
    description: "Your order is ready for delivery.",
  },
  {
    key: "Completed",
    title: "Completed",
    description: "Your order has been completed.",
  },
];

function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("orderNumber") || ""
  );
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const findOrder = async (event) => {
    event.preventDefault();

    const cleanedOrderNumber = orderNumber.trim().toUpperCase();

    if (!cleanedOrderNumber) {
      setError("Please enter your Order ID.");
      setOrder(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      setOrder(null);

      const data = await api.trackOrder(cleanedOrderNumber);

      setOrder(data);
      setOrderNumber(data.orderNumber);
    } catch (error) {
      console.error("Track order error:", error);
      setError(error.message || "Unable to find this order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order?.orderNumber) {
      return;
    }

    socket.connect();

    const handleStatusUpdate = (updatedData) => {
      if (
        updatedData?.orderNumber?.toUpperCase() !==
        order.orderNumber.toUpperCase()
      ) {
        return;
      }

      setOrder((currentOrder) => {
        if (!currentOrder) {
          return currentOrder;
        }

        return {
          ...currentOrder,
          orderStatus:
            updatedData.orderStatus || currentOrder.orderStatus,
          updatedAt: updatedData.order?.updatedAt || currentOrder.updatedAt,
        };
      });
    };

    socket.on("orderStatusUpdated", handleStatusUpdate);

    return () => {
      socket.off("orderStatusUpdated", handleStatusUpdate);
      socket.disconnect();
    };
  }, [order?.orderNumber]);

  const handleCancelOrder = async () => {
    if (!order?.orderNumber) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");
      setSuccessMessage("");

      const result = await api.cancelOrder(order.orderNumber);

      setOrder((currentOrder) => ({
        ...currentOrder,
        orderStatus: result.order.orderStatus,
        updatedAt: result.order.updatedAt,
      }));

      setSuccessMessage(
        "Your order has been cancelled successfully."
      );
    } catch (error) {
      console.error("Cancel order error:", error);
      setError(error.message || "Unable to cancel this order.");
    } finally {
      setCancelling(false);
    }
  };

  const getStepState = (stepKey) => {
    if (!order) {
      return "";
    }

    if (order.orderStatus === "Cancelled") {
      return "cancelled";
    }

    const currentIndex = STATUS_STEPS.findIndex(
      (step) => step.key === order.orderStatus
    );

    const stepIndex = STATUS_STEPS.findIndex(
      (step) => step.key === stepKey
    );

    if (stepIndex < currentIndex) {
      return "completed";
    }

    if (stepIndex === currentIndex) {
      return "active";
    }

    return "";
  };

  const canCancel = order?.orderStatus === "Incoming";

  return (
    <div className="track-order-page">
      <div className="track-order-container">
        <div className="track-order-header">
          <p className="track-order-eyebrow">DAN RESTAURANT</p>

          <h1>Track Your Order</h1>

          <p>
            Enter your Order ID to see the latest status of your
            restaurant order.
          </p>
        </div>

        <form className="track-order-search" onSubmit={findOrder}>
          <label htmlFor="orderNumber">Order ID</label>

          <div className="track-order-search-row">
            <input
              id="orderNumber"
              type="text"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="e.g. DR-583214"
              autoComplete="off"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Tracking..." : "Track Order"}
            </button>
          </div>
        </form>

        {error && (
          <div className="track-order-message track-order-error">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="track-order-message track-order-success">
            {successMessage}
          </div>
        )}

        {order && (
          <section className="track-order-result">
            <div className="track-order-result-header">
              <div>
                <p>ORDER ID</p>
                <h2>{order.orderNumber}</h2>
              </div>

              <span
                className={`track-order-status ${order.orderStatus
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {order.orderStatus}
              </span>
            </div>

            {order.orderStatus === "Cancelled" ? (
              <div className="track-order-cancelled">
                <div className="track-order-cancelled-icon">×</div>

                <div>
                  <h3>Order Cancelled</h3>
                  <p>
                    This order has been cancelled and will not continue
                    through the kitchen.
                  </p>

                  {order.paymentStatus === "Paid" && (
                    <small>
                      Your payment status remains{" "}
                      <strong>{order.paymentStatus}</strong>. Any refund
                      is handled separately by the restaurant.
                    </small>
                  )}
                </div>
              </div>
            ) : (
              <div className="track-order-timeline">
                {STATUS_STEPS.map((step) => {
                  const stepState = getStepState(step.key);

                  return (
                    <div
                      className={`track-order-step ${stepState}`}
                      key={step.key}
                    >
                      <div className="track-order-step-marker">
                        {stepState === "completed" ? "✓" : ""}
                      </div>

                      <div className="track-order-step-content">
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="track-order-summary">
              <div className="track-order-summary-header">
                <div>
                  <p>YOUR ORDER</p>
                  <h3>Order Summary</h3>
                </div>

                <span>
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="track-order-items">
                {order.items.map((item, index) => (
                  <div
                    className="track-order-item"
                    key={`${order.orderNumber}-${index}`}
                  >
                    <div>
                      <strong>
                        {item.quantity} × {item.name}
                      </strong>

                      <span>
                        ₦{Number(item.price).toLocaleString()} each
                      </span>
                    </div>

                    <strong>
                      ₦
                      {(
                        Number(item.price) * item.quantity
                      ).toLocaleString()}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="track-order-total">
                <span>Total</span>

                <strong>
                  ₦{Number(order.totalPrice).toLocaleString()}
                </strong>
              </div>
            </div>

            {canCancel && (
              <div className="track-order-cancel-section">
                <div>
                  <h3>Need to cancel?</h3>
                  <p>
                    You can cancel your order while the restaurant has
                    not started preparing it.
                  </p>
                </div>

                <button
                  type="button"
                  className="track-order-cancel-button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default TrackOrder;