import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import apiConfig from '../../../shared/utils/apiConfig';
import setAuthToken from '../../../eventpro/utils/setAuthToken';

// Dedicated Axios instance for eventpro
const eventProAxios = axios.create({
  baseURL: apiConfig.eventpro,
});

// Log headers and response for debugging
eventProAxios.interceptors.request.use(
  (config) => {
    console.log('eventSlice.js - Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('eventSlice.js - Request interceptor error:', error);
    return Promise.reject(error);
  }
);

eventProAxios.interceptors.response.use(
  (response) => {
    console.log('eventSlice.js - Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('eventSlice.js - Response interceptor error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const initialState = {
  events: [],
  loading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk('eventpro/events/fetchEvents', async (_, { getState, rejectWithValue }) => {
  const { token } = getState().eventpro.auth;
  if (!token) {
    console.log('eventSlice.js - No token found');
    return rejectWithValue('User is not authenticated');
  }
  try {
    setAuthToken(token);
    console.log('eventSlice.js - Fetching events with token:', token);
    const res = await eventProAxios.get('/events', {
      headers: { 'x-auth-token': token },
    });
    return res.data;
  } catch (error) {
    console.error('eventSlice.js - Error fetching events:', error.response?.data || error.message);
    toast.error(error.response?.data?.msg || 'Failed to fetch events');
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch events');
  }
});

export const addEvent = createAsyncThunk('eventpro/events/addEvent', async (event, { getState, rejectWithValue }) => {
  const { token } = getState().eventpro.auth;
  if (!token) {
    console.log('eventSlice.js - No token found');
    return rejectWithValue('User is not authenticated');
  }
  try {
    setAuthToken(token);
    console.log('eventSlice.js - Adding event with token:', token);
    const res = await eventProAxios.post('/events', { ...event, platform: 'eventpro' }, {
      headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
    });
    toast.success('Event added successfully!');
    return res.data.event;
  } catch (error) {
    console.error('eventSlice.js - Error adding event:', error.response?.data || error.message);
    toast.error(error.response?.data?.msg || 'Failed to add event');
    return rejectWithValue(error.response?.data?.msg || 'Failed to add event');
  }
});

export const updateEvent = createAsyncThunk('eventpro/events/updateEvent', async (event, { getState, rejectWithValue }) => {
  const { token } = getState().eventpro.auth;
  if (!token) {
    console.log('eventSlice.js - No token found');
    return rejectWithValue('User is not authenticated');
  }
  try {
    setAuthToken(token);
    console.log('eventSlice.js - Updating event with token:', token);
    console.log('eventSlice.js - Updating event ID:', event._id);
    const res = await eventProAxios.put(`/events/${event._id}`, { ...event, platform: 'eventpro' }, {
      headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
    });
    toast.success('Event updated successfully!');
    return res.data.event; // Expect { _id, eventName, ... }
  } catch (error) {
    console.error('eventSlice.js - Error updating event:', error.response?.data || error.message);
    toast.error(error.response?.data?.msg || 'Failed to update event');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update event');
  }
});

export const deleteEvent = createAsyncThunk('eventpro/events/deleteEvent', async (eventId, { getState, rejectWithValue }) => {
  const { token } = getState().eventpro.auth;
  if (!token) {
    console.log('eventSlice.js - No token found');
    return rejectWithValue('User is not authenticated');
  }
  try {
    setAuthToken(token);
    console.log('eventSlice.js - Deleting event with token:', token);
    await eventProAxios.delete(`/events/${eventId}`, {
      headers: { 'x-auth-token': token },
    });
    toast.success('Event deleted successfully!');
    return eventId;
  } catch (error) {
    console.error('eventSlice.js - Error deleting event:', error.response?.data || error.message);
    toast.error(error.response?.data?.msg || 'Failed to delete event');
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete event');
  }
});

const eventSlice = createSlice({
  name: 'eventpro/events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
      })
      .addCase(addEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        // Fallback if _id is missing
        const eventId = action.payload._id || action.meta.arg._id;
        if (!eventId) {
          console.error('eventSlice.js - Missing _id in updateEvent payload:', action.payload);
          return;
        }
        const index = state.events.findIndex((event) => event._id === eventId);
        if (index !== -1) {
          state.events[index] = { ...action.payload, _id: eventId };
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter((event) => event._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default eventSlice.reducer;
