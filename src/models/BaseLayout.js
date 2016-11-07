import dva from 'dva';

export default {
  namespace: 'baseLayout',
  state: {},
  reducers: {
    fetch(state, action) {
      return { ...state, ...action.payload };
    },
  },
}
