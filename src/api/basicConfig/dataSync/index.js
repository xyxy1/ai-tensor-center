import request from '@/utils/request'

export function getCommunityPush(params) {
  return request({
    url: '/api/ai/community/push01',
    method: 'get',
    params
  })
}