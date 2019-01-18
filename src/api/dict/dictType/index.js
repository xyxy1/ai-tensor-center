import request from '@/utils/request'

export function getDictTypeList(query) {
  return request({
    url: '/api/dict/dictType/page',
    method: 'get',
    params: query
  })
}

export function postDictType(obj) {
  return request({
    url: '/api/dict/dictType',
    method: 'post',
    data: obj
  })
}

export function getDictType(id) {
  return request({
    url: '/api/dict/dictType/' + id,
    method: 'get'
  })
}

export function deleteDictType(id) {
  return request({
    url: '/api/dict/dictType/' + id,
    method: 'delete'
  })
}

export function putDictType(id, obj) {
  return request({
    url: '/api/dict/dictType/' + id,
    method: 'put',
    data: obj
  })
}


export function getDictTypeTree() {
  return request({
    url: '/api/dict/dictType/tree',
    method: 'get'
  })
}
