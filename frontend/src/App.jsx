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
            <Route path="profile" element={<RiderProfile />} />
            <Route path="history" element={<RideHistory />} />
            <Route path="support" element={<SupportChat />} />
            {/* <Route path="complete/:rideId" element={<CompletedRide />} /> */}
          </Route>


          {/* Driver Routes */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverLayout />
              </ProtectedRoute>
            }
          >

            <Route index element={<Navigate to="/driver/home" replace />} />
            <Route path="home" element={<DriverHomePage />} />
            <Route path="dashboard" element={<DriverDashboard />} />
            <Route path="active-ride" element={<ActiveRide />} />
            <Route path="profile" element={<DriverProfile />} />
            <Route path="earnings" element={<DriverEarnings />} />
            <Route path="completed/:rideId" element={<CompletedRide />} />
            <Route path="history" element={<RideHistory />} />
            <Route path="support" element={<SupportChat />} />


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
