import { createSlice } from "@reduxjs/toolkit";
import {
  createEventSpeakers,
  getAllEvents,
  getEventSpeakers,
  getPastEvents,
} from "./thunk";

export const initialState = {
  events: [],
  pastEvents: [],
  eventSpeakers: [],
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
    builder.addCase(getEventSpeakers.fulfilled, (state, action) => {
      state.eventSpeakers = action.payload.data;
    });
    builder.addCase(createEventSpeakers.fulfilled, (state, action) => {
      state.eventSpeakers.push(action.payload.data);
    });
  },
});

export default EventsSlice.reducer;
