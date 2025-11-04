import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import rideReducer from "./rideStore";

const appStore = configureStore({
  reducer: {
    user: userReducer,
    ride: rideReducer
  },
});

export default appStore;