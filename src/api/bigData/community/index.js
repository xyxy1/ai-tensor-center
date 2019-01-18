import request from '@/utils/request'

export function getCommunityList() {
  return request({
    url: `/api/ai/community/allData`,
    method: 'get'
  })
}

export function getCommunity() {
  return request({
    url: `/api/ai/community/info`,
    method: 'get'
  })
}

export function putCommunity(id, query) {
  return request({
    url: `/api/ai/community/${id}`,
    method: 'put',
    data: query
  })
}

export function getCommunityTree() {
  return request({
    url: `/api/ai/mlph/communityTree`,
    method: 'get'
  })
}