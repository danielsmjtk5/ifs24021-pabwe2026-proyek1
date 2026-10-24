import { createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../api/userApi';

const toRejectValue = (error) => ({ message: error.message, errors: error.errors });

export const updateProfile = createAsyncThunk('users/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    return await userApi.updateProfile(payload);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});

export const changePassword = createAsyncThunk('users/changePassword', async (payload, { rejectWithValue }) => {
  try {
    return await userApi.changePassword(payload);
  } catch (error) {
    return rejectWithValue(toRejectValue(error));
  }
});
