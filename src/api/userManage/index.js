import request from '@/utils/request'

// 获取部门树
export function getDepartmentTree() {
  return request({
    url: '/api/admin/depart/tree',
    method: 'get'
  })
}

// 添加部门
export function postDepartment(data) {
  return request({
    url: '/api/admin/depart',
    method: 'post',
    data
  })
}

// 删除部门
export function deleteDepartment(id) {
  return request({
    url: `/api/admin/depart/${id}`,
    method: 'delete'
  })
}

// 修改部门
export function putDepartment(data) {
  return request({
    url: `/api/admin/depart/${data.id}`,
    method: 'put',
    data
  })
}

// 查询部门
export function getDepartment(id) {
  return request({
    url: `/api/admin/depart/${id}`,
    method: 'get'
  })
}

// 更新用户状态
export function putChangeUserStatus(data) {
  return request({
    url: `/api/admin/user/changeStatus`,
    method: 'put',
    data: data
  })
}

// 用户重置密码
export function putResetPassword(id) {
  return request({
    url: `/api/admin/user/${id}/resetPassword`,
    method: 'put'
  })
}

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/api/admin/depart/user',
    method: 'get',
    params
  })
}

// 添加用户
export function postUser(data) {
  return request({
    url: '/api/admin/user',
    method: 'post',
    data
  })
}

// 删除用户
export function deleteUser(data) {
  return request({
    url: '/api/admin/user/batchDelete/',
    method: 'delete',
    data
  })
}

// 修改用户
export function putUser(data) {
  return request({
    url: `/api/admin/user/${data.id}`,
    method: 'put',
    data
  })
}

// 获取用户
export function getUser(id) {
  return request({
    url: `/api/admin/user/${id}`,
    method: 'get'
  })
}

// 获取岗位列表
export function getPositionList(params) {
  return request({
    url: `/api/admin/depart/position`,
    method: 'get',
    params
  })
}

// 添加岗位
export function postPosition(data) {
  return request({
    url: '/api/admin/position',
    method: 'post',
    data
  })
}

// 删除岗位
export function deletePosition(data) {
  return request({
    url: '/api/admin/position/batchDelete/',
    method: 'delete',
    data
  })
}

// 修改岗位
export function putPosition(data) {
  return request({
    url: `/api/admin/position/${data.id}`,
    method: 'put',
    data
  })
}

// 获取岗位
export function getPosition(id) {
  return request({
    url: `/api/admin/position/${id}`,
    method: 'get'
  })
}

// 获取岗位用户
export function getPositionUser(id) {
  return request({
    url: `/api/admin/position/${id}/user`,
    method: 'get'
  });
}

// 修改岗位用户
export function postPositionUser(id, data) {
  return request({
    url: `/api/admin/position/${id}/user`,
    method: 'post',
    data
  })
}

// 获取岗位角色
export function getPositionRole(id) {
  return request({
    url: `/api/admin/position/${id}/group`,
    method: 'get'
  });
}

// 修改岗位角色
export function postPositionRole(id, data) {
  return request({
    url: `/api/admin/position/${id}/group`,
    method: 'post',
    data
  })
}

// 获取岗位部门
export function getPositionDepartment(id) {
  return request({
    url: `/api/admin/position/${id}/depart`,
    method: 'get'
  });
}

// 修改岗位部门
export function postPositionDepartment(id, data) {
  return request({
    url: `/api/admin/position/${id}/depart`,
    method: 'post',
    data
  })
}

// 获取岗位摄像头
export function getPositionCamera(id) {
  return request({
    url: `/api/admin/position/${id}/camera`,
    method: 'get'
  });
}

// 获取摄像头树
export function getCameraTree() {
  return request({
    url: `/api/ai/camera/tree`,
    method: 'get'
  })
}

// 修改岗位摄像头
export function postPositionCamera(id, data) {
  return request({
    url: `/api/admin/position/${id}/camera`,
    method: 'post',
    data: data
  })
}

// 获取部门角色列表
export function getRoleList(query) {
  return request({
    url: `/api/admin/depart/group`,
    method: 'get',
    params: query
  })
}

// 添加角色
export function postRole(data) {
  return request({
    url: '/api/admin/group',
    method: 'post',
    data
  })
}

// 删除角色
export function deleteRole(data) {
  return request({
    url: '/api/admin/group/batchDelete/',
    method: 'delete',
    data
  })
}

// 修改角色
export function putRole(data) {
  return request({
    url: `/api/admin/group/${data.id}`,
    method: 'put',
    data
  })
}

// 获取角色
export function getRole(id) {
  return request({
    url: `/api/admin/group/${id}`,
    method: 'get'
  })
}

// 获取所有角色列表
export function getRoleCopyList(params) {
  return request({
    url: `/api/admin/group/list`,
    method: 'get',
    params
  })
}

// 角色复制
export function postRoleCopy(data) {
  return request({
    url: `/api/admin/group/copy`,
    method: 'post',
    data
  })
}

// 权限分配 - 删除角色资源
export function deleteRoleResourceAuthority(id, data) {
  return request({
    url: `/api/admin/group/${id}/authority/element`,
    method: 'delete',
    data
  })
}

// 权限分配 - 保存角色资源
export function postRoleResourceAuthority(id, data) {
  return request({
    url: `/api/admin/group/${id}/authority/element`,
    method: 'post',
    data
  })
}

// 权限分配 - 保存权限菜单
export function postRoleMenuAuthority(id, data) {
  return request({
    url: `/api/admin/group/${id}/authority/menu`,
    method: 'post',
    data: data
  });
}

// 获取角色菜单树
export function getRoleMenuTree(id, type) {
  return request({
    url: `/api/admin/group/${id}/menu/authorize/${type}/list`,
    method: 'get'
  })
}

// 获取角色
export function getRoleMenuResourceList(id, type, query) {
  return request({
    url: `/api/admin/group/${id}/element/authorize/${type}/list`,
    method: 'get',
    params: query
  })
}

// 权限下发 - 删除角色资源
export function deleteRoleResourceAuthorize(id, data) {
  return request({
    url: `/api/admin/group/${id}/authorize/element`,
    method: 'DELETE',
    data: data
  })
}

// 权限下发 - 保存角色资源
export function postRoleResourceAuthorize(id, data) {
  return request({
    url: `/api/admin/group/${id}/authorize/element`,
    method: 'post',
    data: data
  })
}

// 权限下发 - 保存权限菜单
export function postRoleMenuAuthorize(id, data) {
  return request({
    url: `/api/admin/group/${id}/authorize/menu`,
    method: 'post',
    data: data
  });
}
