import request from '@/utils/request'

export function putClustering(query) {
  return request({
    url: `/api/ai/snap/classify`,
    method: 'put',
    data: query
  })
}