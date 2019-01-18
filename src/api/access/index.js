/**
 * Created by TIMMY on 2018/5/11.
 */
import request from '@/utils/request'

export function getAccessList(params) {
  return request({
    url: '/api/ai/access/list',
    method: 'get',
    params
  })
}

export function postAccess(params) {
  return request({
    url: '/api/ai/access',
    method: 'post',
    data: params
  })
}

export function deleteAccess(id) {
  return request({
    url: `/api/ai/access/${id}`,
    method: 'delete'
  })
}

export function putAccess(params) {
  return request({
    url: `/api/ai/access/${params.id}`,
    method: 'put',
    data: params
  })
}

export function getAccess(id) {
  return request({
    url: `/api/ai/access/${id}`,
    method: 'get'
  })
}
