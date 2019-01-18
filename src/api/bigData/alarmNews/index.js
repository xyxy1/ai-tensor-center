import request from '@/utils/request'

export function postAlarmList(data) {
  return request({
    url: '/api/ai/alarm/list',
    method: 'post',
    data
  })
}

export function getAlarmDetail(id) {
  return request({
    url: `/api/ai/alarm/detail/${id}`,
    method: 'get'
  })
}

export function postAlarmHandle(data) {
  return request({
    url: `/api/ai/alarm/handle`,
    method: 'post',
    data
  })
}