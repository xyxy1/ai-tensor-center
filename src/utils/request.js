import { Loading, Message, MessageBox, Notification } from 'element-ui'
import axios from 'axios'
import store from '@/store'
import { getToken, removeToken } from '@/utils/auth'
let _relist = false;

export default async (setings) => {
  let _loading;
  const cache = setings.cache
  const banLoading = setings.banLoading;
  // create an axios instance
  const service = axios.create({
    // baseURL: process.env.BASE_API, // api的base_url
    timeout: 10000 // request timeout
  })

  // request拦截器
  service.interceptors.request.use(config => {
    // 开启加载提示
    if (!banLoading)
      _loading = Loading.service({
        lock: true,
        text: '加载中，请稍后',
        spinner: 'el-icon-loading',
        customClass: 'common-loading'
      });
    // Do something before request is sent
    if (store.getters.token) {
      config.headers.Authorization = getToken(); // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
    }
    return config
  }, error => {
    _loading && _loading.close();
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  })

  // respone拦截器
  service.interceptors.response.use(
    response => {
      _loading && _loading.close();
      // 返回数据处理
      let res = response.request.responseText;
      if (/(\{|\}|\[|\])/.test(res)) {
        res = JSON.parse(res);
      }

      if (response.status !== 200 && res.status !== 200) {
        Message({
          message: res.message,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('服务出错')
      } else {
        // 判断是否需要缓存数据
        if (cache && !store.getters.inspectType(cache)) {
          // 把请求到的数据放进vuex中
          cache.data = res;
          store.dispatch('addCacheData', cache);
        }

        return res
      }
    },
    error => {
      _loading && _loading.close();

      console.log('err' + error) // for debug
      const response = error.response
      if (response === undefined) {
        Message({
          message: '服务请求超时！',
          type: 'error',
          duration: 5 * 1000
        });
        return Promise.reject(error)
      }
      const info = response.data;
      if (response.status === 401 || info.status === 40101) {
        if (getToken() && !_relist) {
          _relist = true;
          MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
            cancelButtonText: "取消",
            confirmButtonText: "重新登录",
            confirmButtonClass: "el-button--mini",
            cancelButtonClass: "el-button--mini fr",
            type: "warning"
          }).then(() => {
            removeToken()
            _relist = false;
            store.dispatch('LogOut').finally(() => {
              location.reload() // 为了重新实例化vue-router对象 避免bug
            })
          })
        }
      }
      if (response.status === 403) {
        Notification.warning({
          title: '禁止',
          message: info.message,
          type: 'error',
          duration: 2 * 1000
        })
        return Promise.reject('error')
      }
      if (info.status === 30101) {
        Notification.warning({
          title: '失败',
          message: info.message,
          type: 'error',
          duration: 2 * 1000
        })
        return Promise.reject('error')
      }
      if (response.status === 504) {
        Message({
          message: '后端服务异常，请联系管理员！',
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(error)
      }
      Message({
        message: info.message,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }
  )

  // 判断是否获取缓存且数据是否存在
  if (cache && store.getters.inspectType(cache)) {
    // 不用再次请求数据，直接返回缓存数据
    return store.dispatch('getCacheData', cache);
  }

  return await service(setings)
}
