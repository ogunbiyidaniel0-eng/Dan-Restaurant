import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MenuManagement from "./pages/admin/MenuManagement";
import Orders from "./pages/admin/Orders";
import OrderConfirmation from "./pages/OrderConfirmation";
import TrackOrder from "./pages/TrackOrder";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>

        <Route path="/admin/orders" element={<Orders />} />
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/menu"
            element={<MenuManagement />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;