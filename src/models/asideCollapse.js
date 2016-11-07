import dva from 'dva';

export default {
  namespace: 'asideCollapse',
  state: {},
  reducers: {
    fetch(state, action) {
      return { ...state, ...action.payload };
    },
  },
}
