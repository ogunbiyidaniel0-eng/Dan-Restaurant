import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../hooks/useCart";
import "./OrderConfirmation.css";

function OrderConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    let mounted = true;
    let redirectTimer;

    const verifyOrderPayment = async () => {
      const paymentStatus = searchParams.get("status");
      const txRef = searchParams.get("tx_ref");

      console.log("Flutterwave payment status:", paymentStatus);
      console.log("Flutterwave tx_ref:", txRef);

      if (!txRef) {
        if (mounted) {
          setStatus("error");
          setMessage("Payment information was not found.");
        }
        return;
      }

      // Flutterwave tx_ref format:
      // ORDER-<orderId>-<timestamp>
      const orderId = txRef
        .replace(/^ORDER-/, "")
        .replace(/-\d+$/, "");

      console.log("Order ID:", orderId);

      if (paymentStatus !== "successful") {
        if (mounted) {
          setStatus("error");
          setMessage("Your payment was not completed.");
        }
        return;
      }

      try {
        // Verify payment with our backend
        const result = await api.verifyPayment(orderId);

        console.log("Payment verification result:", result);

        if (
          result?.order?.paymentStatus === "Paid" &&
          result?.order?.orderNumber
        ) {
          if (!mounted) return;

          setOrderNumber(result.order.orderNumber);

          clearCart();

          // Show success immediately
          setStatus("success");

          // Automatically redirect to homepage after 3 seconds
          redirectTimer = setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        } else {
          if (mounted) {
            setStatus("error");
            setMessage(
              "We could not confirm your payment. Please contact us if money was deducted."
            );
          }
        }
      } catch (error) {
        console.error("Payment verification error:", error);

        if (mounted) {
          setStatus("error");
          setMessage(
            error.message ||
              "We could not verify your payment. Please contact us if money was deducted."
          );
        }
      }
    };

    verifyOrderPayment();

    return () => {
      mounted = false;

      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [searchParams, clearCart]);

  if (status === "verifying") {
    return (
      <div className="order-confirmation-page">
        <div className="order-confirmation-card">
          <div className="order-confirmation-icon">
            ...
          </div>

          <p className="order-confirmation-eyebrow">
            PROCESSING PAYMENT
          </p>

          <h1>Confirming your payment...</h1>

          <p className="order-confirmation-message">
            Please wait while we confirm your payment
            with Flutterwave.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="order-confirmation-page">
        <div className="order-confirmation-card">
          <div className="order-confirmation-icon">
            !
          </div>

          <p className="order-confirmation-eyebrow">
            PAYMENT STATUS
          </p>

          <h1>Payment could not be confirmed</h1>

          <p className="order-confirmation-message">
            {message}
          </p>

          <button
            className="order-confirmation-button"
            onClick={() => navigate("/")}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="order-confirmation-card">
        <div className="order-confirmation-icon">
          ✓
        </div>

        <p className="order-confirmation-eyebrow">
          ORDER CONFIRMED
        </p>

        <h1>Payment Successful!</h1>

        <p className="order-confirmation-message">
          Thank you for your order. Your payment has
          been received and your meal is now being
          prepared.
        </p>

        <p className="order-confirmation-note">
          Your Order ID:{" "}
          <strong>{orderNumber}</strong>
        </p>

        <div className="order-confirmation-divider"></div>

        <p className="order-confirmation-note">
          Save this ID to track your order anytime.
        </p>

        <p className="order-confirmation-note">
          Redirecting you to the home page...
        </p>

        <button
          className="order-confirmation-button"
          onClick={() =>
            navigate(
              `/track-order?orderNumber=${encodeURIComponent(
                orderNumber
              )}`
            )
          }
        >
          Track Your Order
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;