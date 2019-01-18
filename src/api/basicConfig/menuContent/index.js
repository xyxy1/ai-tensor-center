import request from '@/utils/request'

export function getMenuContentList(query) {
  return request({
    url: '/api/admin/element/list',
    method: 'get',
    params: query
  })
}

export function postMenuContent(obj) {
  return request({
    url: '/api/admin/element',
    method: 'post',
    data: obj
  })
}

export function getMenuContent(id) {
  return request({
    url: '/api/admin/element/' + id,
    method: 'get'
  })
}

export function deleteMenuContent(id) {
  return request({
    url: '/api/admin/element/' + id,
    method: 'delete'
  })
}

export function putMenuContent(id, obj) {
  return request({
    url: '/api/admin/element/' + id,
    method: 'put',
    data: obj
  })
}

