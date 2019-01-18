/**
 * 尾随接口
 */
import request from '@/utils/request'

// 获取尾随列表
export function getDangleAfterList(params) {
  return request({
    url: `/api/ai/snap/dangleAfterList`,
    method: 'post',
    data: params
  })
}

// 获取尾随列表
export function getDangleAfterDetail(params) {
  return request({
    url: `/api/ai/snap/dangleAfterDetail`,
    method: 'get',
    params: params
  })
}