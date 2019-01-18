import request from '@/utils/request'

export function page(query) {
  return request({
    url: '/api/ai/access/list',
    method: 'get',
    params: query
  })
}

export function addObj(obj) {
  return request({
    url: '/api/ai/access/',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/api/ai/access/' + id,
    method: 'get'
  })
}

export function delObj(data) {
  return request({
    url: '/api/ai/access/batchDelete',
    method: 'delete',
    data
  })
}

export function putObj(id, obj) {
  return request({
    url: '/api/ai/access/' + id,
    method: 'put',
    data: obj
  })
}

export function getTest(id) {
  return request({
    url: `/api/ai/access/accessTest/${id}`,
    method: 'get'
  })
}