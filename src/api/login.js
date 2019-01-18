import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/api/auth/jwt/token',
    method: 'post',
    data
  })
}

export function logout(token) {
  return request({
    url: '/api/auth/jwt/invalid',
    method: 'post',
    params: {
      token
    }
  })
}

export function getInfo() {
  return request({
    url: '/api/admin/user/front/info',
    method: 'get'
  })
}

export function getMenus() {
  return request({
    url: '/api/admin/user/front/menus',
    method: 'get'
  })
}

export function getRoute() {
  return request({
    url: '/api/admin/user/front/route',
    method: 'get'
  })
}

export function getTopOrg() {
  return request({
    url: `/api/admin/depart/getTopOrg`,
    method: 'get'
  })
}

export function putChangePassword(data) {
  return request({
    url: `/api/admin/user/changePassword`,
    method: 'put',
    data
  })
}