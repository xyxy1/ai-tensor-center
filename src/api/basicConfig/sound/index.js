import request from '@/utils/request'

export function getVoiceList(query) {
  return request({
    url: '/api/ai/voice/list',
    method: 'get',
    params: query
  })
}

export function getVoice(id) {
  return request({
    url: `/api/ai/voice/${id}`,
    method: 'get'
  })
}

export function deleteVoice(id) {
  return request({
    url: `/api/ai/voice/${id}`,
    method: 'delete'
  })
}

export function postVoice(query) {
  return request({
    url: '/api/ai/voice' + (query.id ? '/' + query.id : ''),
    method: query.id ? 'put' : 'post',
    data: query
  })
}

export function getVoiceTempletList(query) {
  return request({
    url: '/api/ai/voiceTemplet/list',
    method: 'get',
    params: query
  })
}

export function deleteVoiceTemplet({ ids }) {
  return request({
    url: '/api/ai/voiceTemplet/batchDelete',
    method: 'delete',
    data: { ids }
  })
}

export function getVoiceTemplet(id) {
  return request({
    url: `/api/ai/voiceTemplet/${id}`,
    method: 'GET'
  })
}

export function postVoiceTemplet(query) {
  return request({
    url: '/api/ai/voiceTemplet' + (query.id ? '/' + query.id : ''),
    method: query.id ? 'put' : 'post',
    data: query
  })
}