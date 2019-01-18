import { getInfo, getMenus, loginByUsername, logout } from '@/api/login'
import { Message } from 'element-ui'
import { getToken, removeToken, setToken } from '@/utils/auth'

const user = {
  state: {
    place: '',
    user: '',
    status: '',
    code: '',
    token: getToken(),
    name: '',
    username: '',
    departName: '',
    avatar: '',
    introduction: '',
    roles: [],
    menus: undefined,
    elements: undefined,
    permissionMenus: undefined,
    setting: {
      articlePlatform: []
    },
    alarmTotal: 0,
    alarmSwitch: false
  },

  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_USERNAME: (state, username) => {
      state.username = username
    },
    SET_DEPART_NAME: (state, departName) => {
      state.departName = departName
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_MENUS: (state, menus) => {
      state.menus = menus
    },
    SET_ELEMENTS: (state, elements) => {
      state.elements = elements
    },
    LOGIN_SUCCESS: () => {
      console.log('login success')
    },
    LOGOUT_USER: state => {
      state.user = ''
    },
    SET_PERMISSION_MENUS: (state, permissionMenus) => {
      state.permissionMenus = permissionMenus
    },
    SET_ALARM_TOTAL: (state, total) => {
      state.alarmTotal = total
    },
    SET_ALARM_SWITCH: (state, bl) => {
      state.alarmSwitch = bl
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({ dispatch, commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        loginByUsername(username, userInfo.password).then(res => {
          if (res.data === '') {
            Message({
              message: '账户或密码错误！',
              type: 'warning'
            })
            return Promise.reject('error')
          } else {
            setToken(res.data)
            commit('SET_TOKEN', res.data)

            // 清空必要的vuex
            dispatch('resetVisitedViews', {}, { root: true });
            dispatch('realTimeSnapshot/reset', {}, { root: true });
            dispatch('analysis/reset', {}, { root: true });
            dispatch('carBigData/reset', {}, { root: true });

            resolve()
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const data = response
          commit('SET_ROLES', 'admin')
          commit('SET_NAME', data.name)
          commit('SET_USERNAME', data.username)
          commit('SET_DEPART_NAME', data.departName)
          commit('SET_AVATAR', 'http://git.oschina.net/uploads/42/547642_geek_qi.png?1499487420')
          commit('SET_INTRODUCTION', data.description)
          const menus = {}
          for (let i = 0; i < data.menus.length; i++) {
            menus[data.menus[i].code] = true
          }
          commit('SET_MENUS', menus)
          const elements = {}
          for (let i = 0; i < data.elements.length; i++) {
            elements[data.elements[i].code] = true
          }
          commit('SET_ELEMENTS', elements)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
        getMenus().then(response => {
          // console.log(response);
          commit('SET_PERMISSION_MENUS', response)
        })
      })
    },

    // 第三方验证登录
    // LoginByThirdparty({ commit, state }, code) {
    //   return new Promise((resolve, reject) => {
    //     commit('SET_CODE', code)
    //     loginByThirdparty(state.status, state.email, state.code).then(response => {
    //       commit('SET_TOKEN', response.data.token)
    //       setToken(response.data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '');
          commit('SET_ROLES', []);
          commit('SET_MENUS', undefined);
          commit('SET_ELEMENTS', undefined);
          commit('SET_PERMISSION_MENUS', undefined);
          removeToken();
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_MENUS', undefined)
        commit('SET_ELEMENTS', undefined)
        commit('SET_PERMISSION_MENUS', undefined)
        removeToken()
        resolve()
      })
    },

    // 设置警报总数
    SetAlarmTotal({ commit }, total) {
      commit('SET_ALARM_TOTAL', total)
    },

    // 设置警报提醒开关
    SetAlarmSwitch({ commit }, bl) {
      commit('SET_ALARM_SWITCH', bl)
    }
  }
}

export default user
