import "./App.css";
import appStore from "./utils/Redux/appStore";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// common routes
import Login from "./pages/authRoutes/Login";
import Signup from "./pages/authRoutes/Signup";
import HomePage from "./pages/commonRoutes/HomePage";
import ActiveRide from "./pages/commonRoutes/ActiveRide";

// admin
import AdminDashboard from "./pages/adminRoutes/AdminDashboard";
import ManageUsers from "./pages/adminRoutes/ManageUsers";
import ManageDrivers from "./pages/adminRoutes/ManageDrivers";
import ManageRides from "./pages/adminRoutes/ManageRides";
import Analytics from "./pages/adminRoutes/Analytics";
import AdminLayout from "./pages/layouts/AdminLayout";

// user routes
import RiderLayout from "./pages/layouts/RiderLayout";
import RiderProfile from "./pages/userRoutes/RiderProfile";
import RidePayment from "./pages/userRoutes/RidePayment";
import RideRequest from "./pages/userRoutes/RideRequest";
import SearchingRide from "./pages/userRoutes/SearchingRide";
import RideTracking from "./pages/userRoutes/RideTracking";
import RideComplete from "./pages/userRoutes/RideComplete";
import RideHistory from "./pages/commonRoutes/RideHistory";

// driver routes
import DriverHomePage from "./pages/driverRoutes/DriverHomePage";
import DriverDashboard from "./pages/driverRoutes/DriverDashboard";
import DriverLayout from "./pages/layouts/DriverLayout";
import DriverProfile from "./pages/driverRoutes/DriverProfile";
import DriverEarnings from "./pages/driverRoutes/DriverEarnings";
import CompletedRide from "./pages/commonRoutes/CompletedRide";
import AdminSupportDashboard from "./pages/adminRoutes/AdminSupportDashboard";
import SupportChat from "./pages/commonRoutes/SupportChat";
import ScheduleRide from "./pages/userRoutes/ScheduleRide";
import MapWithRoute from "./pages/commonRoutes/MapWithRoute";
import RatingAndReview from "./pages/commonRoutes/RatingAndReview";
// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((store) => store.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "driver") return <Navigate to="/driver" replace />;
    if (user.role === "user") return <Navigate to="/rider" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const user = useSelector((store) => store.user);

  if (user) {
    // Redirect logged-in users to their respective dashboards
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "driver") return <Navigate to="/driver" replace />;
    if (user.role === "user") return <Navigate to="/rider" replace />;
  }

  return children;
};

// NEW: Driver Verification Route Protection
const DriverVerificationRoute = ({ children }) => {
  const user = useSelector((store) => store.user);
  console.log("user: ", user)

  // If driver is not verified, redirect to profile page
  if (user?.role === 'driver' && user?.isVerified === false) {
    // Allow access only to profile page
    const currentPath = window.location.pathname;
    if (currentPath !== '/driver/profile') {
      return <Navigate to="/driver/profile" replace />;
    }
  }
  return children;
};



function App() {
  return (
    <>
      <Provider store={appStore}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Rider Routes */}
          <Route
            path="/rider"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <RiderLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/rider/request" replace />} />
            <Route path="request" element={<RideRequest />} />
            <Route path="searching" element={<SearchingRide />} />
            <Route path="tracking" element={<RideTracking />} />
            <Route path="active-ride" element={<ActiveRide />} />
            <Route path="ride-complete/:rideId" element={<RideComplete />} />
            <Route path="payment/:rideId" element={<RidePayment />} />
            <Route path="rate/:rideId" element={<RatingAndReview />} />
            <Route path="profile" element={<RiderProfile />} />
            <Route path="history" element={<RideHistory />} />
            <Route path="support" element={<SupportChat />} />
            <Route path="scheduleRide" element={<ScheduleRide />} />
            <Route path="track-ride/:pickupLat/:pickupLng/:dropLat/:dropLng" element={<MapWithRoute />} />
          </Route>


          {/* Driver Routes - WITH VERIFICATION PROTECTION */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/driver/home" replace />} />

            {/* Profile page - Always accessible for drivers */}
            <Route path="profile" element={<DriverProfile />} />

            {/* All other routes require verification */}
            <Route path="home" element={
              <DriverVerificationRoute>
                <DriverHomePage />
              </DriverVerificationRoute>
            } />
            <Route path="rate/:rideId" element={
              <DriverVerificationRoute>
                <RatingAndReview />
              </DriverVerificationRoute>
            } />
            <Route path="dashboard" element={
              <DriverVerificationRoute>
                <DriverDashboard />
              </DriverVerificationRoute>
            } />
            <Route path="active-ride" element={
              <DriverVerificationRoute>
                <ActiveRide />
              </DriverVerificationRoute>
            } />
            <Route path="earnings" element={
              <DriverVerificationRoute>
                <DriverEarnings />
              </DriverVerificationRoute>
            } />
            <Route path="completed/:rideId" element={
              <DriverVerificationRoute>
                <CompletedRide />
              </DriverVerificationRoute>
            } />
            <Route path="history" element={
              <DriverVerificationRoute>
                <RideHistory />
              </DriverVerificationRoute>
            } />
            <Route path="support" element={
              <DriverVerificationRoute>
                <SupportChat />
              </DriverVerificationRoute>
            } />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="drivers" element={<ManageDrivers />} />
            <Route path="rides" element={<ManageRides />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="support-dashboard" element={<AdminSupportDashboard />} />
          </Route>
        </Routes>
      </Provider>
    </>
  );
}

export default App;