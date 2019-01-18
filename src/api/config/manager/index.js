import request from '@/utils/request';

export function getFaceConfigList (query) {
  return request ({
    url: '/api/ai/config/list',
    method: 'get',
    params: query,
  });
}

export function postFaceConfig (obj) {
  return request ({
    url: '/api/ai/config/',
    method: 'post',
    data: obj,
  });
}

export function getFaceConfig (id) {
  return request ({
    url: '/api/ai/config/' + id,
    method: 'get',
  });
}

export function deleteFaceConfig (id) {
  return request ({
    url: '/api/ai/config/' + id,
    method: 'delete',
  });
}

export function putFaceConfig (id, obj) {
  return request ({
    url: '/api/ai/config/' + id,
    method: 'put',
    data: obj,
  });
}

export function getCacheToclear (val) {
  return request ({
    url: '/api/ai/config/clearCache/' + val,
    method: 'get',
  });
}

export function getCacheTocheck(name) {
  return request ({
    url: `/api/ai/config/getCache/${name}`,
    method: 'get',
  });
}
