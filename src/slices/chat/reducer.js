import { createSlice } from "@reduxjs/toolkit";
import {
  getDirectContact,
  getChannels,
  getMessages,
  addMessage,
  deleteMessage,
  getDirectsContact,
  getMesages,
} from "./thunk";

export const initialState = {
  chats: [],
  directs: [],
  messages: {},
  channels: [],
  error: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getDirectContact.fulfilled, (state, action) => {
      state.chats = action.payload;
    });
    builder.addCase(getDirectsContact.fulfilled, (state, action) => {
      state.chats = action.payload;
    });
    builder.addCase(getDirectContact.rejected, (state, action) => {
      state.error = action.payload.error || null;
    });

    builder.addCase(getChannels.fulfilled, (state, action) => {
      state.channels = action.payload;
    });
    builder.addCase(getChannels.rejected, (state, action) => {
      state.error = action.payload.error || null;
    });

    builder.addCase(getMessages.fulfilled, (state, action) => {
      state.messages = action.payload;
    });
    builder.addCase(getMesages.fulfilled, (state, action) => {
      state.messages = action.payload;
    });
    builder.addCase(getMessages.rejected, (state, action) => {
      state.error = action.payload.error || null;
    });

    builder.addCase(addMessage.fulfilled, (state, action) => {
      state.messages.push(action.payload);
    });
    builder.addCase(addMessage.rejected, (state, action) => {
      state.error = action.payload.error || null;
    });

    builder.addCase(deleteMessage.fulfilled, (state, action) => {
      state.messages = (state.messages || []).filter(
        (message) => message.id.toString() !== action.payload.toString()
      );
    });
    builder.addCase(deleteMessage.rejected, (state, action) => {
      state.error = action.payload.error || null;
    });
  },
});

export default chatSlice.reducer;
