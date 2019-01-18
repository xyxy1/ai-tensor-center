import request from '@/utils/request'

export function page(query) {
  return request({
    url: '/api/ai/snap/list',
    method: 'post',
    data: query
  })
}

export function addObj(obj) {
  return request({
    url: '/api/ai/snap/',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/api/ai/snap/' + id,
    method: 'get'
  })
}

export function delObj(id) {
  return request({
    url: '/api/ai/snap/' + id,
    method: 'delete'
  })
}

export function putObj(id, obj) {
  return request({
    url: '/api/ai/snap/' + id,
    method: 'put',
    data: obj
  })
}

export function getBackgd(query) {
  return request({
    url: '/api/ai/snap/viewBg',
    method: 'get',
    params: query
  })
}

export function addImg(obj) {
  return request({
    url: '/api/ai/snap/manualAddImg',
    method: 'post',
    data: obj
  })
}

export function changeIdentity(obj) {
  return request({
    url: '/api/ai/snap/changeIdentityNo',
    method: 'put',
    data: obj
  })
}

export function getSnapZip(data) {
  return request({
    url: '/api/ai/snap/snapZip',
    method: 'post',
    data
  });
}
