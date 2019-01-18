import request from '@/utils/request'

class CommonMapAPI {
  getLocation(parentCode) {
    return request({
      url: '/api/ai/terminal/location/',
      method: 'get'
    })
  }
}

export default new CommonMapAPI()
