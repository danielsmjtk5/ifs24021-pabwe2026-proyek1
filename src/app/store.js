import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/states/authSlice';
import reportsReducer from '../features/reports/states/reportsSlice';
import dashboardReducer from '../features/dashboard/states/dashboardSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  reports: reportsReducer,
  dashboard: dashboardReducer,
});

export function setupStore(preloadedState) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

const store = setupStore();

export default store;
