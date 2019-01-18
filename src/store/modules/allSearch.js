export default {
  namespaced: true,
  state: {
    data: null
  },
  getters: {
    getData(state) {
      return state.data;
    }
  },
  mutations: {
    setData(state, data) {
      state.data = data;
    }
  },
  actions: {
    setData: ({ commit }, data) => {
      commit('setData', data);
    }
  }
}
