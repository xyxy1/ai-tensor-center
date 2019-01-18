import request from '@/utils/request'

export function page(query) {
  return request({
    url: '/api/ai/sms/list',
    method: 'get',
    params: query
  })
}

export function addObj(obj) {
  return request({
    url: '/api/ai/sms/',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/api/ai/sms/' + id,
    method: 'get'
  })
}

export function delObj(data) {
  return request({
    url: '/api/ai/sms/batchDelete',
    method: 'delete',
    data
  })
}

export function putObj(id, obj) {
  return request({
    url: '/api/ai/sms/' + id,
    method: 'put',
    data: obj
  })
}

export function getTest(val) {
  return request({
    url: '/api/ai/sms/smsTest/' + val,
    method: 'get'
  })
}
