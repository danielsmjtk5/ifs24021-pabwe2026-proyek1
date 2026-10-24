import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import dashboardApi from '../api/dashboardApi';
import { logoutUser } from '../../auth/states/authSlice';

export const fetchStats = createAsyncThunk('dashboard/fetchStats', async (_, { rejectWithValue }) => {
  try {
    return await dashboardApi.getStats();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = { stats: null, status: 'idle', error: null };

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export default dashboardSlice.reducer;
