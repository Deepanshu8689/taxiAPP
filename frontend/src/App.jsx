import "./App.css";
import appStore from "./utils/Redux/appStore";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// common routes
import Login from "./pages/authRoutes/Login";
import Signup from "./pages/authRoutes/Signup";
import HomePage from "./pages/commonRoutes/HomePage";

// admin
import AdminDashboard from "./pages/adminRoutes/AdminDashboard";

// user routes
import RiderLayout from "./pages/layouts/RiderLayout";
import RiderProfile from "./pages/userRoutes/RiderProfile";
import RideRequest from "./pages/userRoutes/RideRequest";
import SearchingRide from "./pages/userRoutes/SearchingRide";
import RideTracking from "./pages/userRoutes/RideTracking";
import RideComplete from "./pages/userRoutes/RideComplete";

// driver routes
import DriverPage from "./pages/driverRoutes/DriverPage";
import DriverDashboard from "./pages/driverRoutes/DriverDashboard";

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
            {/* <Route path="active" element={<ActiveRide />} /> */}
            <Route path="ride-complete/:rideId" element={<RideComplete />} />
            <Route path="profile" element={<RiderProfile />} />
            {/* <Route path="history" element={<RideHistory />} /> */}
          </Route>

          <Route path="/driver-homepage" element={<DriverPage />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* </Route> */}
        </Routes>
      </Provider>
    </>
  );
}

export default App;
