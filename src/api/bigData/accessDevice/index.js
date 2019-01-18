import request from '@/utils/request'

// 获取门禁列表
export function getAccessList(params) {
  return request({
    url: '/api/ai/access/list',
    method: 'get',
    params
  })
}