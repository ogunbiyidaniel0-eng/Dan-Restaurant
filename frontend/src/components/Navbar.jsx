import { useState } from "react";
import { useCart } from "../hooks/useCart";
import Cart from "./Cart";
import "./Navbar.css";

function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { cartCount } = useCart();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <a href="/" className="navbar-brand">
          Dan Restaurant
        </a>

        {/* Desktop navigation */}
        <div className={`navbar-links ${menuOpen ? "mobile-open" : ""}`}>
          <a href="/" onClick={closeMenu}>
            Home
          </a>

          <a href="/#menu" onClick={closeMenu}>
            Menu
          </a>

          <a href="/#track-order" onClick={closeMenu}>
            Track Order
          </a>

          <a href="/#about" onClick={closeMenu}>
            About
          </a>
        </div>

        <div className="navbar-actions">
          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
          >
            <span className="cart-icon">🛒</span>
            <span>Cart</span>

            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </button>

          <button
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}

export default Navbar;