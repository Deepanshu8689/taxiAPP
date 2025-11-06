import { createSlice } from "@reduxjs/toolkit";

const rideSlice = createSlice({
  name: "feed",
  initialState: [],
  reducers: {
    addRide: (state, action) => {
      state.push( action.payload );
    },
    removeRideFromFeed: (state, action) => {
      const newRide = state.filter((user) => user._id !== action.payload);
      return newRide;
    },
  },
});

export const { addRide, removeRideFromFeed } = rideSlice.actions;
export default rideSlice.reducer;