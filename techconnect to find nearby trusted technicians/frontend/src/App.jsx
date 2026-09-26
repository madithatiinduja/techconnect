import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BottomNavigation from "./components/BottomNavigation.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import BookingTrackingPage from "./pages/BookingTrackingPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ClientDashboard from "./pages/ClientDashboard.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import TechnicianDashboard from "./pages/TechnicianDashboard.jsx";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/booking/technician/:technicianId"
          element={
            <ProtectedRoute role="client">
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/order/:orderId"
          element={
            <ProtectedRoute role="client">
              <BookingTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute role="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/technician"
          element={
            <ProtectedRoute role="technician">
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNavigation />
    </>
  );
}
