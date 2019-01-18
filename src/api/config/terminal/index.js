import request from '@/utils/request'

export function page(query) {
  return request({
    url: '/api/ai/terminal/list',
    method: 'get',
    params: query
  })
}

export function addObj(obj) {
  return request({
    url: '/api/ai/terminal/',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/api/ai/terminal/' + id,
    method: 'get'
  })
}

export function delObj(query) {
  return request({
    url: '/api/ai/terminal/batchDelete',
    method: 'delete',
    data: query
  })
}

export function putObj(id, obj) {
  return request({
    url: '/api/ai/terminal/' + id,
    method: 'put',
    data: obj
  })
}
