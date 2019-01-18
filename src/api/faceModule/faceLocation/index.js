import request from '@/utils/request'

export function postFaceDetect(params) {
  return request({
    url: '/api/ai/image/detect',
    method: 'POST',
    data: params
  })
}

export function postFaceDeepDetect(params) {
  return request({
    url: '/api/ai/image/deepDetect',
    method: 'POST',
    data: params
  })
}