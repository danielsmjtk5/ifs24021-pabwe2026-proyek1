import reportApi from '../../reports/api/reportApi';

const dashboardApi = {
  getStats: () => reportApi.getStats(),
};

export default dashboardApi;
