import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authApi from '../api/authApi';
import { updateProfile } from '../../users/states/usersSlice';

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  try {
    return await authApi.me();
  } catch (error) {
    // 401 berarti belum login, bukan kesalahan aplikasi.
    if (error.status === 401) return null;
    throw error;
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authApi.login(credentials);
  } catch (error) {
    return rejectWithValue({ message: error.message, errors: error.errors });
  }
});

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.register(payload);
  } catch (error) {
    return rejectWithValue({ message: error.message, errors: error.errors });
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch {
    // Sesi lokal tetap dibersihkan walaupun server tidak dapat dihubungi.
  }
});

const initialState = {
  user: null,
  // 'idle' -> belum dicek, 'checking' -> sedang memeriksa sesi, 'ready' -> selesai
  sessionStatus: 'idle',
  sessionError: null,
  sessionExpired: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionExpired(state) {
      if (state.user) state.sessionExpired = true;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.sessionStatus = 'checking';
        state.sessionError = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.sessionStatus = 'ready';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.sessionStatus = 'ready';
        state.user = null;
        state.sessionError = action.error.message;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.sessionExpired = false;
        state.sessionError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.sessionExpired = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.sessionExpired = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;
