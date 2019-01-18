import request from '@/utils/request'

export function getControlList(params) {
  return request({
    url: '/api/car/autoExecuteControl/list',
    method: 'get',
    params
  })
}

export function postControl(data) {
  return request({
    url: `/api/car/autoExecuteControl/`,
    method: 'post',
    data
  })
}

export function deleteControl(data) {
  return request({
    url: '/api/car/autoExecuteControl/batchDelete',
    method: 'delete',
    data
  })
}

export function putControl(data) {
  return request({
    url: `/api/car/autoExecuteControl/${data.id}`,
    method: 'put',
    data
  })
}

export function getControl(id) {
  return request({
    url: `/api/car/autoExecuteControl/${id}`,
    method: 'get'
  })
}