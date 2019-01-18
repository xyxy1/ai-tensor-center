import request from '@/utils/request'

// 获取省市县树
export function getAreaTree() {
  return request({
    url: '/api/ai/xzq/tree',
    method: 'get'
  })
}

// 获取街道及居委会树
export function getMenuTree(params) {
  return request({
    url: '/api/ai/xzjd/tree',
    method: 'get',
    params
  })
}

// 获取小区列表
export function getCommunityList(params) {
  return request({
    url: '/api/ai/community/list',
    method: 'get',
    params
  })
}

// 获取小区
export function getCommunity(id) {
  return request({
    url: `/api/ai/community/${id}`,
    method: 'get',
  })
}

//编辑小区
export function putCommunity(id,data) {
  return request({
    url: `/api/ai/community/${id}`,
    method: 'put',
    data
  })
}

// 新增街道
export function postStreet(data) {
  return request({
    url: `/api/ai/xzjd/`,
    method: 'post',
    data
  })
}

// 删除街道
export function deleteStreet(id) {
  return request({
    url: `/api/ai/xzjd/${id}`,
    method: 'delete'
  })
}

// 修改街道
export function putStreet(data) {
  return request({
    url: `/api/ai/xzjd/${data.id}`,
    method: 'put',
    data
  })
}

// 获取街道
export function getStreet(id) {
  return request({
    url: '/api/ai/xzjd/' + id,
    method: 'get'
  })
}

// 新增居委会
export function postCommittee(data) {
  return request({
    url: `/api/ai/sqjcwh/`,
    method: 'post',
    data
  })
}

// 删除居委会
export function deleteCommittee(id) {
  return request({
    url: `/api/ai/sqjcwh/${id}`,
    method: 'delete'
  })
}

// 修改居委会
export function putCommittee(data) {
  return request({
    url: `/api/ai/sqjcwh/${data.id}`,
    method: 'put',
    data
  })
}

// 获取居委会
export function getCommittee(id) {
  return request({
    url: '/api/ai/sqjcwh/' + id,
    method: 'get'
  })
}

// 获取派出所分页列表
export function getPoliceList(params) {
  return request({
    url: '/api/ai/pcs/list',
    method: 'get',
    params
  })
}

// 新增派出所
export function postPolice(data) {
  return request({
    url: `/api/ai/pcs/`,
    method: 'post',
    data
  })
}

// 批量删除派出所
export function deletePolice(data) {
  return request({
    url: `/api/ai/pcs/batchDelete`,
    method: 'delete',
    data
  })
}

// 修改派出所
export function putPolice(data) {
  return request({
    url: `/api/ai/pcs/${data.id}`,
    method: 'put',
    data
  })
}

// 获取派出所
export function getPolice(id) {
  return request({
    url: '/api/ai/pcs/' + id,
    method: 'get'
  })
}