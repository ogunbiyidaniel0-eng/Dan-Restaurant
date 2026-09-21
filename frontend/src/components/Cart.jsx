import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import "./Cart.css";

function Cart({ isOpen, onClose }) {
  const navigate = useNavigate();

  const {
    cartItems,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  if (!isOpen) {
    return null;
  }

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      <div className="cart-overlay" onClick={onClose}></div>

      <aside className="cart-drawer">
        <div className="cart-header">
          <div>
            <p className="cart-eyebrow">YOUR ORDER</p>
            <h2>Your Cart</h2>
          </div>

          <button className="cart-close" onClick={onClose}>
            ×
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>

            <h3>Your cart is empty</h3>

            <p>
              Add something delicious from our menu to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item._id}>
                  <div className="cart-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>🍽️</span>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-item-heading">
                      <h3>{item.name}</h3>

                      <button
                        className="cart-remove"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Remove
                      </button>
                    </div>

                    <p>
                      ₦{Number(item.price).toLocaleString()} each
                    </p>

                    <div className="cart-item-bottom">
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            decreaseQuantity(item._id)
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() =>
                            increaseQuantity(item._id)
                          }
                        >
                          +
                        </button>
                      </div>

                      <strong>
                        ₦
                        {(
                          Number(item.price) * item.quantity
                        ).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-summary-row">
                <span>Items</span>
                <span>{cartCount}</span>
              </div>

              <div className="cart-summary-row cart-total">
                <span>Total</span>

                <strong>
                  ₦{cartTotal.toLocaleString()}
                </strong>
              </div>

              <button
                className="checkout-button"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default Cart;