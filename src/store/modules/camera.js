import {
  query,
  create,
  patch,
  remove,
  detail,
  tree,
  table,
  updateFlag,
} from '@/api/camera'

export default {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    // 列表
    query({ commit }, params) {
      return query(params);
    },
    create({ commit }, params) {
      return create(params);
    },
    // 详情
    detail({ commit }, id) {
      return detail(id)
    },
    // 删除
    remove({ commit }, params) {
      return remove(params)
    },
    // 编辑
    patch({ commit }, params) {
      return patch(params)
    },
    // 树形
    tree() {
      return tree()
    },
    // 启用/禁用
    updateFlag({ commit }, params) {
      return updateFlag(params)
    },
    // 启用/禁用
    table({ commit }, params) {
      return table(params)
    }
  }
}
