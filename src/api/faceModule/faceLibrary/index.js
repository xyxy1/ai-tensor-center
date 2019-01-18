import request from '@/utils/request'

export function page(query) {
  return request({
    url: '/api/ai/library/list',
    method: 'get',
    params: query
  })
}

export function addObj(obj) {
  return request({
    url: '/api/ai/library/',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/api/ai/library/' + id,
    method: 'get'
  })
}

export function getFullObj(id) {
  return request({
    url: `/api/ai/library/fullInfo/${id}`,
    method: 'get'
  })
}

export function delObj(id) {
  return request({
    url: '/api/ai/library/' + id,
    method: 'delete'
  })
}

export function putObj(id, obj) {
  return request({
    url: '/api/ai/library/' + id,
    method: 'put',
    data: obj
  })
}
