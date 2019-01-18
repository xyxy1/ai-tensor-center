/**
 * Created by TIMMY on 2018/5/11.
 */
import request from '@/utils/request'
export function query(params) {
  return request({
    url: '/api/ai/camera/list',
    method: 'get',
    params
  })
}

export function create(params) {
  return request({
    url: '/api/ai/camera',
    method: 'post',
    data: params

  })
}
export function patch(params) {
  return request({
    url: `/api/ai/camera/${params.id}`,
    method: 'put',
    data: params

  })
}
export function remove(params) {
  return request({
    url: `/api/ai/camera/batchDelete`,
    method: 'delete',
    data: params
  })
}
export function detail(id) {
  return request({
    url: `/api/ai/camera/${id}`,
    method: 'get'
  })
}
export function tree() {
  return request({
    url: '/api/ai/terminal/selectPage?limit=32768&offset=1',
    method: 'get'
  })
}
export function table(params) {
  return request({
    url: '/api/ai/mlph/display',
    method: 'get',
    params
  })
}
export function updateFlag(params) {
  return request({
    url: '/api/ai/camera/updateFlag',
    method: 'get',
    params
  })
}

export function getAccess() {
  return request({
    url: '/api/ai/access/selectPage',
    method: 'get'
  })
}


export function getSms() {
  return request({
    url: '/api/ai/sms/selectPage',
    method: 'get'
  })
}


export function getApp() {
  return request({
    url: '/api/ai/app/selectPage',
    method: 'get'
  })
}


export function getVoice() {
  return request({
    url: '/api/ai/voice/selectPage',
    method: 'get'
  })
}

export function getTest(val) {
  return request({
    url: '/api/ai/camera/closeTest/' + val,
    method: 'get'
  })
}

export function getSelectData() {
  return request({
    url: `/api/ai/camera/selectData`,
    method: 'get'
  })
}

export function getAllCameraList() {
  return request({
    url: '/api/ai/camera/allBaseInfo',
    method: 'get'
  })
}