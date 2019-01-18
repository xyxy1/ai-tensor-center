import {
  query,
  create,
  patch,
  remove,
  detail,
  tree,
  updateFlag,
  police
} from '@/api/district/unit'

export default {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    // 列表
    query({commit}, params){
      return query(params);
    },
    create({commit}, params){
      return create(params);
    },
    // 详情
    detail({commit}, id){
      return detail(id)
    },
    // 删除
    remove({commit}, id){
      return remove(id)
    },
    // 编辑
    patch({commit}, params){
      return patch(params)
    },
    // 树形
    tree(){
      return tree()
    },
    // 启用/禁用
    updateFlag({commit}, params){
      return updateFlag(params)
    },
    // 启用/禁用
    police({commit}, params){
      return police(params)
    }
  }
}
