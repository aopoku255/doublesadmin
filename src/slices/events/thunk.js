import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getAllEvents as getEventsApi,
  addEvents as addEventApi,
  getPastEvents as getPastEventsApi,
  getEventSpeakers as getEventSpeakersApi,
  createEventSpeakers as createEventSpeakersApi,
} from "../../helpers/fakebackend_helper";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const getAllEvents = createAsyncThunk(
  "events/getAllEvents",
  async () => {
    try {
      const response = await getEventsApi();

      return response;
    } catch (error) {
      return error;
    }
  }
);

export const getPastEvents = createAsyncThunk(
  "events/getPastEvents",
  async () => {
    try {
      const response = await getPastEventsApi();

      return response;
    } catch (error) {
      return error;
    }
  }
);

export const getEventSpeakers = createAsyncThunk(
  "events/getEventSpeakers",
  async () => {
    try {
      const response = await getEventSpeakersApi();
      console.log(response);
      return response;
    } catch (error) {
      return error;
    }
  }
);

export const createEventSpeakers = createAsyncThunk(
  "events/createEventSpeakers",
  async (data) => {
    try {
      const response = await createEventSpeakersApi(data);
      console.log(response);
      return response;
    } catch (error) {
      return error;
    }
  }
);

export const addEvent = (event, history) => async () => {
  console.log(event?.eventImages);
  try {
    const formData = new FormData();

    formData.append(`image`, event?.eventImages[0]);

    formData.append("eventTitle", event.eventName);
    formData.append("eventStartDate", event.startDate);
    formData.append("eventEndDate", event.endDate);
    formData.append("eventLocation", event.location);
    formData.append("eventHost", event.eventHost);
    formData.append("eventDescription", event.eventDescription);
    formData.append("adminId", event.adminId);
    formData.append("eventStartTime", event.eventStartTime);
    formData.append("eventEndTime", event.eventEndTime);

    const response = await addEventApi(formData);

    const data = response;

    if (response.status === "Success") {
      setTimeout(() => {
        toast.success("Event Added Successfully", { autoClose: 3000 });
      }, 3000);
      history("/upcoming-events");
    }

    return data;
  } catch (error) {
    toast.error("Event Added Failed", { autoClose: 3000 });
    return error;
  }
};
