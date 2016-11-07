import dva from 'dva';

export default {
  namespace: 'sideMenu',
  state: {},
  reducers: {
    fetch(state, action) {
      return { ...state, ...action.payload };
    },
  },
}
