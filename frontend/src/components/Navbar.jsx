import { useState } from "react";
import { useCart } from "../hooks/useCart";
import Cart from "./Cart";
import "./Navbar.css";

function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Dan Restaurant</div>

        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="/#menu">Menu</a>
          <a href="/#track-order">Track Order</a>
          <a href="/#about">About</a>
        </div>

        <button
          className="cart-button"
          onClick={() => setCartOpen(!cartOpen)}
          
        >
          🛒 Cart

          {cartCount > 0 && (
            <span className="cart-count">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}

export default Navbar;