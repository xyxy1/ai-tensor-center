import request from '@/utils/request'

export function getCarHistroyList() {
  return request({
    url: '/api/car/autoPassRecord/todayHistroy',
    method: 'get'
  })
}