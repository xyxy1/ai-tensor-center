import request from '@/utils/request'

// 获取社区列表
export function getCommunityList() {
  return request({
    url: '/api/ai/community/allData',
    method: 'get'
  })
}

// 获取摄像头列表
export function getCameraList(params) {
  return request({
    url: '/api/ai/camera/list',
    method: 'get',
    params
  })
}

export function postCamera(data) {
  return request({
    url: `/api/ai/camera`,
    method: 'post',
    data
  })
}

export function deleteCamera(data) {
  return request({
    url: '/api/ai/camera/batchDelete',
    method: 'delete',
    data
  })
}

export function putCamera(data) {
  return request({
    url: `/api/ai/camera/${data.id}`,
    method: 'put',
    data
  })
}

export function getCamera(id) {
  return request({
    url: `/api/ai/camera/${id}`,
    method: 'get'
  })
}