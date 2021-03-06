import request from '@/utils/request'


export function fetchTree(query) {
    return request({
      url: '/api/ai/resource/tree',
      method: 'get',
      params: query
    })
  }
  
  export function fetchAll() {
    return request({
      url: '/api/ai/resource/all',
      method: 'get'
    })
  }

export function addObj(obj) {
    return request({
        url: '/api/ai/resource',
        method: 'post',
        data: obj
    })
}

export function getObj(id) {
    return request({
        url: '/api/ai/resource/' + id,
        method: 'get'
    })
}

export function delObj(id) {
    return request({
        url: '/api/ai/resource/' + id,
        method: 'delete'
    })
}

export function putObj(id, obj) {
    return request({
        url: '/api/ai/resource/' + id,
        method: 'put',
        data: obj
    })
}
