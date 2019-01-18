import request from '@/utils/request'

// 当日抓拍统计信息
export function getStatistics() {
  return request({
    url: `/api/ai/statistics/snapInfo`,
    method: 'get',
    banLoading: true
  })
}

// 获取人员分布信息
export function getDayLabel() {
  return request({
    url: `/api/ai/statistics/dayLabel`,
    method: 'get',
    banLoading: true
  })
}

// 获取一周抓拍人脸走势
export function getDaySnap() {
  return request({
    url: `/api/ai/statistics/daySnap`,
    method: 'get',
    banLoading: true
  })
}

// 获取一周预警走势
export function getDayBlack() {
  return request({
    url: `/api/ai/statistics/dayBlack`,
    method: 'get',
    banLoading: true
  })
}

// 获取最新半小时历史数据
export function getHistoryList(params) {
  return request({
    url: `/api/ai/snap/label`,
    method: 'get',
    params: params,
    banLoading: true
  })
}

export async function getHistoryTrailList(params) {
  return await request({
    url: `/api/ai/snap/labelDetail`,
    method: 'get',
    params: params,
    banLoading: true
  })
}

// 获取大数据视窗当天记录
export function getAnalysisHistoryList() {
  return request({
    url: `/api/ai/snap/todayHistroy`,
    method: 'get',
    banLoading: true
  })
}