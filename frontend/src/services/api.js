const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  // =========================
  // MENU
  // =========================

  getMenu: async () => {
    const response = await fetch(`${API_URL}/menu`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to load menu"
      );
    }

    return data;
  },

  createMenuItem: async (menuItem) => {
    const response = await fetch(`${API_URL}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(menuItem),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to create menu item"
      );
    }

    return data;
  },

  updateMenuItem: async (id, menuItem) => {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(menuItem),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to update menu item"
      );
    }

    return data;
  },

  deleteMenuItem: async (id) => {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to delete menu item"
      );
    }

    return data;
  },

  toggleMenuAvailability: async (id) => {
    const response = await fetch(
      `${API_URL}/menu/${id}/toggle-availability`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Failed to update menu availability"
      );
    }

    return data;
  },

  // =========================
  // AUTH
  // =========================

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Login failed"
      );
    }

    return data;
  },

  logout: async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Logout failed"
      );
    }

    return data;
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to get admin"
      );
    }

    return data;
  },

  forgotPassword: async (email) => {
    const response = await fetch(
      `${API_URL}/auth/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Failed to send reset email"
      );
    }

    return data;
  },

  resetPassword: async (token, password) => {
    const response = await fetch(
      `${API_URL}/auth/reset-password/${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Failed to reset password"
      );
    }

    return data;
  },

  // =========================
  // ORDERS
  // =========================

  createOrder: async (orderData) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to create order"
      );
    }

    return data;
  },

  initializePayment: async (orderId) => {
    const response = await fetch(
      `${API_URL}/orders/${orderId}/initialize-payment`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Failed to initialize payment"
      );
    }

    return data;
  },

  verifyPayment: async (orderId) => {
    const response = await fetch(
      `${API_URL}/orders/${orderId}/verify-payment`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Failed to verify payment"
      );
    }

    return data;
  },

  getAllOrders: async () => {
    const response = await fetch(`${API_URL}/orders`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Failed to load orders"
      );
    }

    return data;
  },

  getOrderById: async (id) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Failed to load order"
      );
    }

    return data;
  },
  

  updateOrderStatus: async (id, status) => {
    const response = await fetch(
      `${API_URL}/orders/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Failed to update order status"
      );
    }

    return data;
  },

  trackOrder: async (orderNumber) => {
  const response = await fetch(
    `${API_URL}/orders/track/${encodeURIComponent(orderNumber)}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to track order");
  }

  return data;
},

cancelOrder: async (orderNumber) => {
  const response = await fetch(
    `${API_URL}/orders/track/${encodeURIComponent(orderNumber)}/cancel`,
    {
      method: "PATCH",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to cancel order");
  }

  return data;
},
};