import { createContext, useEffect, useState } from "react";

const CartContext = createContext();

function getSavedCart() {
  try {
    const savedCart = localStorage.getItem(
      "danRestaurantCart"
    );

    return savedCart
      ? JSON.parse(savedCart)
      : [];
  } catch (error) {
    console.error(
      "Failed to load saved cart:",
      error
    );

    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] =
    useState(getSavedCart);

  useEffect(() => {
    localStorage.setItem(
      "danRestaurantCart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) =>
          cartItem._id === item._id
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem._id === item._id
            ? {
                ...cartItem,
                quantity:
                  cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item._id !== id
      )
    );
  };

  const increaseQuantity = (id) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item._id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;