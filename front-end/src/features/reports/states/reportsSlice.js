import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import reportApi from '../api/reportApi';
import { logoutUser } from '../../auth/states/authSlice';

const toRejectValue = (error) => ({ message: error.message, errors: error.errors, status: error.status });

const wrap = (type, fn) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (error) {
      return rejectWithValue(toRejectValue(error));
    }
  });

export const fetchReports = wrap('reports/fetchList', (params) => reportApi.getReports(params));
export const fetchReport = wrap('reports/fetchDetail', (id) => reportApi.getReport(id));
export const createReport = wrap('reports/create', (values) => reportApi.createReport(values));
export const updateReport = wrap('reports/update', ({ id, values }) => reportApi.updateReport(id, values));
export const deleteReport = wrap('reports/delete', async (id) => {
  await reportApi.deleteReport(id);
  return id;
});
export const changeReportStatus = wrap('reports/changeStatus', ({ id, status, note }) =>
  reportApi.changeStatus(id, { status, note }),
);
export const addReportNote = wrap('reports/addNote', ({ id, note }) => reportApi.addNote(id, { note }));

const initialState = {
  list: { items: [], pagination: null, status: 'idle', error: null },
  detail: { item: null, status: 'idle', error: null },
};

const setDetail = (state, action) => {
  state.detail = { item: action.payload, status: 'succeeded', error: null };
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.list.status = 'loading';
        state.list.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.list = {
          items: action.payload.reports,
          pagination: action.payload.pagination,
          status: 'succeeded',
          error: null,
        };
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.list.status = 'failed';
        state.list.error = action.payload.message;
      })
      .addCase(fetchReport.pending, (state) => {
        state.detail = { item: null, status: 'loading', error: null };
      })
      .addCase(fetchReport.fulfilled, setDetail)
      .addCase(fetchReport.rejected, (state, action) => {
        state.detail = { item: null, status: 'failed', error: action.payload.message };
      })
      .addCase(createReport.fulfilled, setDetail)
      .addCase(updateReport.fulfilled, setDetail)
      .addCase(changeReportStatus.fulfilled, setDetail)
      .addCase(addReportNote.fulfilled, setDetail)
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.list.items = state.list.items.filter((r) => r.id !== action.payload);
        if (state.detail.item?.id === action.payload) state.detail = initialState.detail;
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export default reportsSlice.reducer;
