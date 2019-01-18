import request from '@/utils/request'

export function page(query) {
  return request({
    url: '/api/ai/app/list',
    method: 'get',
    params: query
  })
}

export function addObj(obj) {
  return request({
    url: '/api/ai/app/',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/api/ai/app/' + id,
    method: 'get'
  })
}

export function delObj(data) {
  return request({
    url: '/api/ai/app/batchDelete',
    method: 'delete',
    data
  })
}

export function putObj(id, obj) {
  return request({
    url: '/api/ai/app/' + id,
    method: 'put',
    data: obj
  })
}

export function getTest(val) {
  return request({
    url: '/api/ai/app/appTest/' + val,
    method: 'get'
  })
}
