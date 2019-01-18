import request from '@/utils/request'

// 获取门禁列表
export function getAccessRecordsList(params) {
  return request({
    url: '/api/ai/accessRecord/list',
    method: 'get',
    params
  })
}

// 获取小区门禁树
export function getCommunityTree() {
  return request({
    url: '/api/ai/access/communityTree',
    method: 'get'
  })
}