import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { api } from "../services/api";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Create the order in MongoDB
      const orderData = {
        guestName: formData.name,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        deliveryAddress: formData.address,

        items: cartItems.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
      };

      const order = await api.createOrder(orderData);

      console.log("Order created:", order);

      // Initialize Flutterwave payment
      const payment = await api.initializePayment(order._id);

      console.log("Payment initialized:", payment);

      // Redirect customer to Flutterwave
      window.location.href = payment.paymentLink;
    } catch (error) {
      console.error("Checkout error:", error);

      setError(
        error.message || "Something went wrong while processing your order."
      );

      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h1>Your cart is empty</h1>

          <p>
            Add some delicious meals before checking out.
          </p>

          <button onClick={() => navigate("/")}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        <div className="checkout-header">
          <p>YOUR ORDER</p>

          <h1>Checkout</h1>

          <span>
            Enter your details and we'll take care of the rest.
          </span>
        </div>

        <div className="checkout-layout">

          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >
            <div className="checkout-section">
              <h2>Customer Details</h2>

              <div className="checkout-field">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08012345678"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="address">
                  Delivery Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your delivery address"
                  rows="4"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="place-order-button"
              disabled={loading}
            >
              {loading
                ? "Processing Payment..."
                : "Continue to Payment"}
            </button>
          </form>

          <aside className="checkout-summary">

            <div className="checkout-summary-header">
              <h2>Order Summary</h2>

              <span>
                {cartItems.length} items
              </span>
            </div>

            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div
                  className="checkout-summary-item"
                  key={item._id}
                >
                  <div>
                    <h3>{item.name}</h3>

                    <span>
                      {item.quantity} × ₦
                      {Number(item.price).toLocaleString()}
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

            <div className="checkout-summary-total">
              <span>Total</span>

              <strong>
                ₦{cartTotal.toLocaleString()}
              </strong>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}

export default Checkout;