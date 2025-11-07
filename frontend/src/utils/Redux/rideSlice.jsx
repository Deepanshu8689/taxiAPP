import { createSlice } from "@reduxjs/toolkit";

const rideSlice = createSlice({
  name: "ride",
  initialState: {
    currentRide: null,     // currently active or accepted ride
    rideFeed: [],          // (optional) for admin or driver feed of available rides
  },
  reducers: {
    // Store or update the current user’s active ride
    setCurrentRide: (state, action) => {
      state.currentRide = action.payload;
    },

    // Clear current ride (on completion or cancellation)
    clearCurrentRide: (state) => {
      state.currentRide = null;
    },

    // Store multiple rides (e.g., feed for drivers or admin)
    setRideFeed: (state, action) => {
      state.rideFeed = action.payload;
    },

    // Add a new ride to feed (only for global/admin usage)
    addRideToFeed: (state, action) => {
      const exists = state.rideFeed.some(r => r._id === action.payload._id);
      if (!exists) state.rideFeed.push(action.payload);
    },

    // Remove ride from feed (e.g., when accepted/cancelled)
    removeRideFromFeed: (state, action) => {
      state.rideFeed = state.rideFeed.filter(r => r._id !== action.payload);
    },
  },
});

export const {
  setCurrentRide,
  clearCurrentRide,
  setRideFeed,
  addRideToFeed,
  removeRideFromFeed,
} = rideSlice.actions;

export default rideSlice.reducer;
