const axios = require("axios");
const sendEmail = require("../utils/sendEmail");
const Admin = require("../models/admin.model");
const Order = require("../models/order.model");
const MenuItem = require("../models/menuItem.model");

const generateOrderNumber = async () => {
  let orderNumber;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    orderNumber = `DR-${randomNumber}`;

    exists = await Order.exists({ orderNumber });
  }

  return orderNumber;
};

const createOrder = async (req, res) => {
  try {
    const {
      guestName,
      guestEmail,
      guestPhone,
      deliveryAddress,
      items,
    } = req.body;

    if (
      !guestName ||
      !guestEmail ||
      !guestPhone ||
      !deliveryAddress ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "Guest details and at least one item are required",
      });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const entry of items) {
      const menuItem = await MenuItem.findById(entry.menuItemId);

      if (!menuItem) {
        return res.status(404).json({
          error: `Menu item not found: ${entry.menuItemId}`,
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          error: `"${menuItem.name}" is currently unavailable`,
        });
      }

      const quantity = entry.quantity || 1;
      const lineTotal = menuItem.price * quantity;

      totalPrice += lineTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity,
        price: menuItem.price,
      });
    }

    const order = await Order.create({
      orderNumber: await generateOrderNumber(),
      guestName,
      guestEmail: guestEmail.toLowerCase().trim(),
      guestPhone,
      deliveryAddress,
      items: orderItems,
      totalPrice,
    });

    req.app.get("io").emit("newOrder", order);

    res.status(201).json(order);
  } catch (error) {
    console.error("Create Order Error:", error.message);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const initializePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        error: "This order has already been paid for",
      });
    }

    const tx_ref = `ORDER-${order._id}-${Date.now()}`;

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref,
        amount: order.totalPrice,
        currency: "NGN",
        redirect_url: `${process.env.FRONTEND_URL}/order-confirmation`,
        customer: {
          email: order.guestEmail,
          phonenumber: order.guestPhone,
          name: order.guestName,
        },
        customizations: {
          title: "Restaurant Order Payment",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    order.paymentReference = tx_ref;
    await order.save();

    res.status(200).json({
      paymentLink: response.data.data.link,
    });
  } catch (error) {
    console.error(
      "Initialize Payment Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to initialize payment",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    // If payment was already verified,
    // simply return the paid order.
    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        message: "Order already confirmed as paid",
        order,
      });
    }

    if (!order.paymentReference) {
      return res.status(400).json({
        error: "No payment has been initialized for this order",
      });
    }

    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${order.paymentReference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    const transaction = response.data.data;

    // Verify status, amount and currency
    const isVerified =
      transaction.status === "successful" &&
      Number(transaction.amount) === Number(order.totalPrice) &&
      transaction.currency === "NGN";

    if (!isVerified) {
      order.paymentStatus = "Failed";

      await order.save();

      return res.status(400).json({
        error: "Payment verification failed",
        details: transaction.status,
      });
    }

    // -----------------------------------------
    // PAYMENT SUCCESSFULLY VERIFIED
    // -----------------------------------------

    order.paymentStatus = "Paid";

    // Order number should already exist because
    // it is created when the order is created.
    if (!order.orderNumber) {
      order.orderNumber = await generateOrderNumber();
    }

    await order.save();

    // -----------------------------------------
    // RETURN SUCCESS TO FRONTEND IMMEDIATELY
    // -----------------------------------------

    res.status(200).json({
      message: "Payment verified successfully",
      order,
    });

    // -----------------------------------------
    // SEND EMAILS AFTER PAYMENT IS CONFIRMED
    // -----------------------------------------

    try {
      await sendEmail({
        to: order.guestEmail,
        subject: "Your Dan Restaurant Order is Confirmed!",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Thanks for your order, ${order.guestName}!</h2>

            <p>
              We've received your payment and your order
              is now being processed.
            </p>

            <p>
              <strong>Order ID:</strong>
              ${order.orderNumber}
            </p>

            <p>
              <strong>Order Total:</strong>
              ₦${order.totalPrice}
            </p>

            <p>
              <strong>Delivery Address:</strong>
              ${order.deliveryAddress}
            </p>

            <p>
              You can use your Order ID to track your
              order on Dan Restaurant.
            </p>

            <p>
              We'll keep you updated as your order
              moves through the kitchen.
            </p>
          </div>
        `,
      });

      console.log(
        `Customer confirmation email sent for ${order.orderNumber}`
      );
    } catch (emailError) {
      console.error(
        "Customer confirmation email failed:",
        emailError.message
      );
    }

    // -----------------------------------------
    // ADMIN EMAIL
    // -----------------------------------------

    try {
      const admin = await Admin.findOne();

      if (admin) {
        await sendEmail({
          to: admin.email,
          subject: "New Dan Restaurant Order!",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>New order from ${order.guestName}</h2>

              <p>
                <strong>Order ID:</strong>
                ${order.orderNumber}
              </p>

              <p>
                <strong>Total:</strong>
                ₦${order.totalPrice}
              </p>

              <p>
                <strong>Phone:</strong>
                ${order.guestPhone}
              </p>

              <p>
                <strong>Delivery Address:</strong>
                ${order.deliveryAddress}
              </p>

              <p>
                Log in to the admin dashboard to view
                the full order and start preparing it.
              </p>
            </div>
          `,
        });

        console.log(
          `Admin order email sent for ${order.orderNumber}`
        );
      }
    } catch (emailError) {
      console.error(
        "Admin notification email failed:",
        emailError.message
      );
    }

    // -----------------------------------------
    // REAL-TIME ADMIN NOTIFICATION
    // -----------------------------------------

    req.app.get("io").emit("orderPaid", order);
  } catch (error) {
    console.error(
      "Verify Payment Error:",
      error.response?.data || error.message
    );

    // Important:
    // Do not send a 500 response if the response
    // was already sent after successful verification.
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to verify payment",
      });
    }
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = status ? { orderStatus: status } : {};

    const orders = await Order.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get All Orders Error:", error.message);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Get Order Error:", error.message);

    res.status(500).json({
      error: "Server error",
    });
  }
};

// PUBLIC CUSTOMER TRACKING
const trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      return res.status(400).json({
        error: "Order ID is required",
      });
    }

    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase().trim(),
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found. Please check your Order ID.",
      });
    }

    res.status(200).json({
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,

      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),

      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    console.error("Track Order Error:", error.message);

    res.status(500).json({
      error: "Failed to track order",
    });
  }
};

// PUBLIC CUSTOMER CANCELLATION
const cancelOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      return res.status(400).json({
        error: "Order ID is required",
      });
    }

    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase().trim(),
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found. Please check your Order ID.",
      });
    }

    // Customer can only cancel an incoming order
    if (order.orderStatus !== "Incoming") {
      return res.status(400).json({
        error: `This order can no longer be cancelled because it is already ${order.orderStatus.toLowerCase()}.`,
      });
    }

    order.orderStatus = "Cancelled";

    await order.save();

    // Notify all connected clients
    req.app.get("io").emit("orderStatusUpdated", {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      order: order,
    });

    // Return only customer-safe information
    res.status(200).json({
      message: "Your order has been cancelled.",
      order: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalPrice: order.totalPrice,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Cancel Order Error:", error.message);

    res.status(500).json({
      error: "Failed to cancel order",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "Incoming",
      "Preparing",
      "Ready",
      "Completed",
      "Cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    order.orderStatus = status;

    await order.save();

    // Notify customer tracking pages and other connected clients
    req.app.get("io").emit("orderStatusUpdated", {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      order: order,
    });

    res.status(200).json(order);
  } catch (error) {
    console.error(
      "Update Order Status Error:",
      error.message
    );

    res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  initializePayment,
  verifyPayment,
  trackOrder,
  cancelOrder,
};