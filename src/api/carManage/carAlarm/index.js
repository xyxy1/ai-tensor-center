import request from '@/utils/request'

export function getCarAlarmList(params) {
  return request({
    url: '/api/car/autoAlarmLog/list',
    method: 'get',
    params
  })
}