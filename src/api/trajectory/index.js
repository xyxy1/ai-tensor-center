/**
 * 轨迹接口
 */
import Mock from 'mockjs'
import request from '@/utils/request'

// 提交以图搜图
export function postImageSearch(params) {
  return request({
    url: '/api/ai/image/search',
    method: 'POST',
    data: params
  })
}

// 获取用户轨迹
export function getUsetTrajectory(params) {
  return request({
    url: '/api/ai/snap/trackList',
    method: 'get',
    params: params
  })
}

// 获取轨迹列表
export function getTrajectoryList(params) {
  // Mock.mock('http://ts.com/trajectory/pagingList', {
  //   status: 200,
  //   data: {
  //     "rows|20": [{
  //       "id|+1": 1000,
  //       name: "@cname",
  //       identify: '@string("number", 18)',
  //       time: "@datetime()",
  //       addr: "@county(true)",
  //       bgImg: "@image('340x180', '#ccc', '#000', '背景')",
  //       snapImg: "@image('180x180', '#ccc', '#000', '相片')",
  //       "lng|86-130.4-6": 1,
  //       "lat|20-42.4-6": 1
  //     }]
  //   }
  // });
  // return request({
  //   url: 'http://ts.com/trajectory/pagingList',
  //   method: 'get'
  // })

  return request({
    url: '/api/ai/snap/trackPage',
    method: 'get',
    params: params
  })
}

// 获取轨迹详情
export function getTrajectoryDetails(id) {
  return request({
    url: `/api/ai/snap/trackDetail/${id}`,
    method: 'get'
  })
}

export function getPersonnelList(params) {
  Mock.mock('http://ts.com/trajectory/personnelList', {
    "list|10": [{
      "id|+1": 1000,
      name: "@cname",
      identify: '@string("number", 18)',
      time: "@datetime()",
      type: "@ctitle(3, 3)",
      pic: "@dataImage('100x100')",
      "frequency|20-1000": 1,
      remark: "@ctitle(3, 8)"
    }]
  });
  return request({
    url: 'http://ts.com/trajectory/personnelList',
    method: 'POST',
    data: params
  })
}
