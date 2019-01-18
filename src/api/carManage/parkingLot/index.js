import request from '@/utils/request'

export function getParkingLotList(params) {
  return request({
    url: '/api/car/autoPark/page',
    method: 'get',
    params
  })
}

export function getParkingLot(id) {
  return request({
    url: `/api/car/autoPark/${id}`,
    method: 'get'
  })
}

export function putParkingLot(data) {
  return request({
    url: `/api/car/autoPark/${data.id}`,
    method: 'put',
    data
  })
}
