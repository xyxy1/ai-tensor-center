import request from '@/utils/request'

export function getCommunity() {
  return request({
    url: `/api/ai/community/front`,
    method: 'get'
  })
}

export function getStatistics() {
  return request({
    url: `/api/ai/statistics/snapInfo`,
    method: 'get'
  })
}

export function getChartData() {
  return request({
    url: `/api/ai/alarm/statis`,
    method: 'get'
  })
}