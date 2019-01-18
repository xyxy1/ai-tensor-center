import { fetchList } from '@/api/faceModule/faceLabel';
import { fetchSnap } from '@/api/config/snap';

const cluster = {
  namespaced: true,
  state: {
    clusterData: {
      data: [],
      page: 1,
      size: 24,
      total: 0
    },
    categoryListData: {
      data: [],
      page: 1,
      size: 12,
      total: 0
    },
  },
  mutations: {
    SAVECLUSTER: (state, payload) => {
      state.clusterData = { ...payload };
    },
    SAVECATEGORYLISTDATA: (state, payload) => {
      state.categoryListData = { ...payload };
    }
  },
  actions: {
    fetchCluster({ commit, state }, payload) {
      const { page, size = state.clusterData.size, identityNo = '' } = payload;
      const offset = (page - 1) * size + 1;
      return new Promise((resolve, reject) => {
        fetchList({ offset, limit: size, identityNo, name }).then(response => {
          const { rows, total } = response.data;
          commit('SAVECLUSTER', { data: rows, total, page, size });
          resolve();
        }).catch(error => {
          reject(error);
        })
      })
    },
    fetchCategoryList({ commit, state }, payload) {
      const { page, size = state.categoryListData.size, identityNo, timeStart, timeEnd } = payload;
      const offset = (page - 1) * size + 1;
      return new Promise((resolve, reject) => {
        fetchSnap({ offset, limit: size, identityNo, timeStart, timeEnd }).then(response => {
          const { rows, total } = response.data;
          commit('SAVECATEGORYLISTDATA', { data: rows, total, page, size });
          resolve();
        }).catch(error => {
          reject(error);
        })
      })
    }
  }
}

export default cluster
