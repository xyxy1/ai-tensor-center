import request from '@/utils/request'
import Mock from 'mockjs'

export function getDictValueList(query) {
  return request({
    url: '/api/dict/dictValue/page',
    method: 'get',
    params: query
  })
}

export function postDictValue(obj) {
  return request({
    url: '/api/dict/dictValue',
    method: 'post',
    data: obj
  })
}

export function getDictValue(id) {
  return request({
    url: '/api/dict/dictValue/' + id,
    method: 'get'
  })
}

export function deleteDictValue({ ids }) {
  return request({
    url: '/api/dict/dictValue/batchDelete',
    method: 'delete',
    data: { ids }
  })
}

export function putDictValue(id, obj) {
  return request({
    url: '/api/dict/dictValue/' + id,
    method: 'put',
    data: obj
  })
}

export function getDictValueType(code) {
  return request({
    url: '/api/dict/dictValue/type/' + code,
    method: 'get',
    cache: {
      id: code,
      type: 'dictionary'
    }
  })
}
