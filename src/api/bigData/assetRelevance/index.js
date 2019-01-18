import request from '@/utils/request'

// 获取车辆列表
export function getCarList(params) {
  return request({
    url: '/api/car/autoCar/list',
    method: 'get',
    params
  })
}

// 获取物业列表
export function getPropertyList(params) {
  return request({
    url: '/api/ai/propManageFee/list',
    method: 'get',
    params
  })
}

// 获取物业列表
export function getcommunityTree() {
  return request({
    url: '/api/ai/mlph/communityTree',
    method: 'get'
  })
}