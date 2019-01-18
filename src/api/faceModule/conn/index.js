import request from '@/utils/request'

export function page(query) {
  return request({
    url: 'api/ai/conn/list',
    method: 'get',
    params: query
  })
}

export function addObj(obj) {
  return request({
    url: '/api/ai/conn/',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/api/ai/conn/' + id,
    method: 'get'
  })
}

export function delObj(id) {
  return request({
    url: '/api/ai/conn/' + id,
    method: 'delete'
  })
}

export function putObj(id, obj) {
  return request({
    url: '/api/ai/conn/' + id,
    method: 'put',
    data: obj
  })
}
