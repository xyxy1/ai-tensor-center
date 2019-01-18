import request from '@/utils/request'
export function postLabelSearch(data) {
  return request({
    url: '/api/ai/label/search',
    method: 'post',
    data
  })
}

// 获取查看标签
export function getLabelDetails(id) {
  return request({
    url: `/api/ai/label/getSearchLabel/${id}`,
    method: 'get'
  })
}