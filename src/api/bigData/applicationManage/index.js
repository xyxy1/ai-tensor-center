import request from '@/utils/request'

// 获取应用列表
export function getApplicationList(params) {
  return request({
    url: '/api/ai/confAps/list',
    method: 'get',
    params
  })
}

// 新增应用信息
export function postApplication(data) {
  return request({
    url: `/api/ai/confAps`,
    method: 'post',
    data
  })
}

// 删除应用
export function deleteApplication(data) {
  return request({
    url: '/api/ai/confAps/batchDelete',
    method: 'delete',
    data
  })
}

// 修改应用信息
export function putApplication(data) {
  return request({
    url: `/api/ai/confAps/${data.id}`,
    method: 'put',
    data
  })
}

// 获取应用信息
export function getApplication(id) {
  return request({
    url: `/api/ai/confAps/${id}`,
    method: 'get'
  })
}

// 获取居委会
export function getCommittee() {
  return request({
    url: '/api/ai/sqjcwh/all',
    method: 'get'
  })
}