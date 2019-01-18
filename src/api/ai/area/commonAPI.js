import request from '@/utils/request'

class CommonAreaAPI {
  getComboList(parentCode) {
    return request({
      url: '/api/admin/common/area/combo/' + parentCode,
      method: 'get'
    })
  }
}

export default new CommonAreaAPI()
