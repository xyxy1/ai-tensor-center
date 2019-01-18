import request from '@/utils/request'

export function getNoDetectList() {
  return request({
    url: '/api/ai/common/noDetectList',
    method: 'get'
  })
}

export function getAbnormalList() {
  return request({
    url: '/api/ai/common/noFeatureList',
    method: 'get'
  })
}

export function delNoDetectFile(directoryName) {
  return request({
    url: `/api/ai/common/noDetectDelete/${directoryName}`,
    method: 'get'
  })
}

export function delAbnormalFile() {
  return request({
    url: `/api/ai/common/noFeatureDelete/${directoryName}`,
    method: 'get'
  })
}

export function getNoDetectZip(query) {
  return request({
    url: '/api/ai/common/noFeatureZip',
    method: 'get',
    params: query,
    responseType: 'arraybuffer'
  }).then(response => {
    // debugger
    let blob = new Blob([response], { type: "application/zip" });
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `未对齐文件_${query.name}.zip`;
    link.click();
  });
}

export function getAbnormalZip(query) {
  return request({
    url: '/api/ai/common/noFeatureZip',
    method: 'get',
    params: query,
    responseType: 'arraybuffer'
  }).then(response => {
    // debugger
    let blob = new Blob([response], { type: "application/zip" });
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `异常文件_${query.name}.zip`;
    link.click();
  });
}
