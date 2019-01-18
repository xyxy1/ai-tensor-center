import request from '@/utils/request'

export function getCarSnapList(params) {
  return request({
    url: '/api/car/autoPassRecord/list',
    method: 'get',
    params
  })
}