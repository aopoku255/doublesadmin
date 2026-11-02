import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getAllEvents as getEventsApi,
  addEvents as addEventApi,
  editEvent as editEventApi,
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
  if (
    !event.eventName ||
    !event.startDate ||
    !event.endDate ||
    !event.eventImages?.length
  ) {
    toast.error("Add a name, start and end date, and an image", {
      autoClose: 3000,
    });
    return;
  }

  if (new Date(event.endDate) < new Date(event.startDate)) {
    toast.error("The event must end after it starts", { autoClose: 3000 });
    return;
  }

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
    toast.error(`Event not added: ${error}`, { autoClose: 3000 });
    return error;
  }
};

export const editEvent = (id, data, history) => async () => {
  try {
    const response = await editEventApi(id, data);
    toast.success("Event Updated", { autoClose: 3000 });
    history("/upcoming-events");
    return response;
  } catch (error) {
    toast.error(`Event not updated: ${error}`, { autoClose: 3000 });
    return error;
  }
};
