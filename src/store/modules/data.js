const state = {
  dataList: {} // 咨询已访问的id列表。避免重复加载
}

const actions = {
  // 添加缓存数据
  addCacheData: ({ commit }, data) => {
    commit('ADD_CACHE_DATA_LIST', data);
  },

  // 获取缓存数据
  getCacheData: ({ commit, state }, data) => {
    return state.dataList[data.type][data.id];
  }
}

const getters = {
  inspectType: (state, getters) => ({ type, id }) => {
    if (!state.dataList[type]) {
      return false;
    }
    return !!state.dataList[type][id];
  }
}

const mutations = {
  // 添加路由类型
  ['ADD_CACHE_DATA_LIST'](state, { type, id, data }) {
    if (!state.dataList[type]) {
      state.dataList[type] = [];
    }

    state.dataList[type][id] = data;
  }
}

export default {
  state,
  actions,
  getters,
  mutations
}
