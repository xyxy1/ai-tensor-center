import request from '@/utils/request'

export function postFaceFeature(params) {
  return request({
    url: '/api/ai/image/feature',
    method: 'POST',
    data: params
  })
}