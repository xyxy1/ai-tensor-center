/**
 * Created by TIMMY on 2018/5/11.
 */
import request from '@/utils/request'
export function query(params) {
  return request({
    url: '/api/ai/terminal/list',
    method: 'get',
    params

  })
}
export function create(params) {
  return request({
    url: '/api/ai/terminal',
    method: 'post',
    data:params

  })
}
export function patch(params) {
  return request({
    url: `/api/ai/terminal/${params.id}`,
    method: 'put',
    data:params

  })
}
export function remove(id) {
  return request({
    url: `/api/ai/terminal/${id}`,
    method: 'delete'
  })
}
export function detail(id) {
  return request({
    url: `/api/ai/terminal/${id}`,
    method: 'get'
  })
}
