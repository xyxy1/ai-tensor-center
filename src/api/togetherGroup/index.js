/**
 * 同行接口
 */
import request from '@/utils/request'

// 获取同行列表
export function getTogetherGroupList(data) {
  return request({
    url: `/api/ai/snap/togetherGroupList`,
    method: 'post',
    data
  })
}

// 获取同行详情
export function getTogetherGroupDetail(params) {
  return request({
    url: `/api/ai/snap/togetherGroupDetail`,
    method: 'get',
    params
  })
}

// 获取同行列表
export function getTogetherGroupArrayList(data) {
  return request({
    url: `/api/ai/snap/togetherGroupListByGroup`,
    method: 'post',
    data
  })
}

// 获取同行详情
export function getTogetherGroupArrayDetail(params) {
  return request({
    url: `/api/ai/snap/togetherGroupDetail`,
    method: 'get',
    params
  })
}