import { constantRouterMap } from '@/router';
import Layout from '@/views/layout/Layout';
import { getAllMenu } from '@/api/basicConfig/menu/index';
import { getRoute } from '@/api/login';
import { newPageFilter } from '@/utils/config';

const _import = require('@/router/_import_' + process.env.NODE_ENV);

/**
 * 通过authority判断是否与当前用户权限匹配
 * @param menus
 * @param route
 */
function hasPermission(menus, route) {
  if (route.authority) {
    if (menus[route.authority] !== undefined) {
      return menus[route.authority];
    } else {
      return false;
    }
  } else {
    return true;
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, menus, menuDatas) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(menus, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, menus, menuDatas);
      }
      return true;
    }
    return false;
  });
  return accessedRouters;
}

/**
 * 获取当前路由表
 * @param 路由数据
 */
function getCurrentRouterList(routerData) {
  let _newRouter = [{
    path: '',
    component: Layout,
    children: []
  }];
  routerData.forEach(item => {
    if (!item.code || !item.path) {
      return;
    }

    let _alias = item.alias;

    item.component = eval(item.component);
    item.name = item.title;
    delete item.id;
    delete item.code;
    delete item.title;
    delete item.href;
    delete item.spread;
    delete item.alias;
    delete item.children;
    delete item.parentId;

    if (_alias) {
      item.meta = {};
      item.meta.label = _alias;
    }

    if (newPageFilter.includes(_alias)) {
      _newRouter.push(item);
    } else {
      _newRouter[0].children.push(item);
    }
  });

  return _newRouter;
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers;
      state.routers = constantRouterMap.concat(routers);
    }
  },
  actions: {
    GenerateRoutes({ commit }, menus) {
      return new Promise(resolve => {
        getRoute().then(response => {
          let _routers = getCurrentRouterList(response);

          getAllMenu().then(data => {
            const menuDatas = {};
            for (let i = 0; i < data.length; i++) {
              menuDatas[data[i].code] = data[i];
            }
            const accessedRouters = filterAsyncRouter(
              _routers,
              menus,
              menuDatas
            );
            commit('SET_ROUTERS', accessedRouters);
            resolve();
          });
        });
      });
    }
  }
};

export default permission;