import { createSlice } from "@reduxjs/toolkit";
import { getAllEvents, getPastEvents } from "./thunk";

export const initialState = {
  events: [],
  pastEvents: [],
};

const EventsSlice = createSlice({
  name: "Events",
  initialState,
  reducer: {},
  extraReducers: (builder) => {
    builder.addCase(getAllEvents.fulfilled, (state, action) => {
      state.events = action.payload.data;
    });
    builder.addCase(getPastEvents.fulfilled, (state, action) => {
      state.pastEvents = action.payload.data;
    });
  },
});

export default EventsSlice.reducer;
