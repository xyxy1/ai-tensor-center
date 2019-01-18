import request from '@/utils/request'

// 获取门楼牌号列表
export function getMlphList(query) {
  return request({
    url: '/api/ai/mlph/selectPage',
    method: 'get',
    params: query
  })
}

// 获取门禁摄像头
export function getAreaCameras() {
  return request({
    url: '/api/ai/camera/areaCameras',
    method: 'get'
  })
}

export function getmlphName() {
  return request({
    url: '/api/ai/mlph/selectPage',
    method: 'get'
  })
}

// 人脸聚类外层接口
export function fetchList(query) {
  return request({
    url: '/api/ai/label/list',
    method: 'get',
    params: query
  })
}

// 删除所有陌生人标签
export function deleteCluster() {
  return request({
    url: '/api/ai/label/deleteCluster',
    method: 'get'
  })
}

// 修改证件照
export function putIdentityImage(query) {
  return request({
    url: '/api/ai/image/identityImage',
    method: 'put',
    data: query
  })
}

/* 2018-09UI更新 */
// 获取标签类型
export function getLabelType() {
  return request({
    url: '/api/ai/library/selectPage',
    method: 'get'
  })
}

// 导出标签包
export function getLabelZip(query) {
  return request({
    url: '/api/ai/label/labelZip',
    method: 'get',
    params: query
  })
}

// 获取标签库列表
export function getLabelLibraryList() {
  return request({
    url: '/api/ai/library/labelLibrary',
    method: 'get'
  })
}

// 添加标签库
export function postLabelLibrary(query) {
  return request({
    url: '/api/ai/library',
    method: 'post',
    data: query
  })
}

// 删除标签库
export function deleteLabelLibrary(id) {
  return request({
    url: `/api/ai/library/${id}`,
    method: 'delete'
  })
}

// 修改标签库
export function putLabelLibrary(id, query) {
  return request({
    url: `/api/ai/library/${id}`,
    method: 'put',
    data: query
  })
}

// 获取标签库
export function getLabelLibrary(id) {
  return request({
    url: `/api/ai/library/${id}`,
    method: 'get'
  })
}

// 获取标签列表
export function getLabelList(query) {
  return request({
    url: '/api/ai/label/list',
    method: 'get',
    params: query
  })
}

// 添加标签
export function postLabel(query) {
  return request({
    url: '/api/ai/label/save',
    method: 'post',
    data: query
  })
}

// 删除标签
export function deleteLabel(query) {
  return request({
    url: `/api/ai/label/batchDelete`,
    method: 'delete',
    data: query
  })
}

// 修改标签
export function putLabel(query) {
  return request({
    url: '/api/ai/label/update',
    method: 'put',
    data: query
  })
}

// 获取标签
export function getLabel(id) {
  return request({
    url: `/api/ai/label/getLabel/${id}`,
    method: 'get'
  })
}