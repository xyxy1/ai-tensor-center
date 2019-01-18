import request from '@/utils/request'

// 抓拍数据列表
export function fetchSnap(query) {
  return request({
    url: '/api/ai/snap/list',
    method: 'get',
    params: query
  })
}
