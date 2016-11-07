import dva from 'dva';

export default {
  namespace: 'buttons',
  state: {},
  reducers: {
    fetch(state, action) {
      return { ...state, ...action.payload };
    },
  },
}
