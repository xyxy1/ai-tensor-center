import request from '@/utils/request'

// 获取社区列表
export function getLabelLibraryList() {
  return request({
    url: '/api/ai/library/communityTree',
    method: 'get'
  })
}