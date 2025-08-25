import { createAsyncThunk } from "@reduxjs/toolkit";

//Include Both Helper File with needed methods
import {
  getDirectContact as getDirectContactApi,
  getDirectsContact as getDirectsContactApi,
  getMessages as getMessagesApi,
  getMesages as getMesagesApi,
  getChannels as getChannelsApi,
  addMessage as addMessageApi,
  deleteMessage as deleteMessageApi,
} from "../../helpers/fakebackend_helper";

export const getDirectContact = createAsyncThunk(
  "chat/getDirectContact",
  async () => {
    try {
      const response = getDirectContactApi();
      return response;
    } catch (error) {
      return error;
    }
  }
);

export const getDirectsContact = createAsyncThunk(
  "chat/getDirectsContact",
  async () => {
    try {
      const response = await getDirectsContactApi();

      return response;
    } catch (error) {
      return error;
    }
  }
);

export const getChannels = createAsyncThunk("chat/getChannels", async () => {
  try {
    const response = getChannelsApi();
    return response;
  } catch (error) {
    return error;
  }
});

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (roomId) => {
    try {
      const response = getMessagesApi(roomId);
      const data = await response;
      return data;
    } catch (error) {
      return error;
    }
  }
);

export const getMesages = createAsyncThunk("chat/getMesages", async () => {
  try {
    const response = await getMesagesApi();
    const data = response;

    return data;
  } catch (error) {
    return error;
  }
});

export const addMessage = createAsyncThunk(
  "chat/addMessage",
  async (message) => {
    try {
      const response = addMessageApi(message);
      const data = await response;
      return data;
    } catch (error) {
      return error;
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "chat/deleteMessage",
  async (message) => {
    try {
      const response = deleteMessageApi(message);
      const data = await response;
      return data;
    } catch (error) {
      return error;
    }
  }
);
