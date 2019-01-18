import request from '@/utils/request'

export function postFaceCompare(params) {
  return request({
    url: '/api/ai/image/compare',
    method: 'POST',
    data: params
  })
}