// 数据整理
function dataArrange(state, commit, data, key) {
  data.keyTime = key; // 时间戳，唯一标识

  // 保存摄像头数据
  if (state.cameraIdList.indexOf(data.autoParkId) >= 0) {
    // 保存对应摄像头数据
    commit('saveCameraList', data);
  }

  // 图片列表滚动
  commit('saveImgList', data);
  // 右侧信息展示
  commit('saveAnalysisList', data);

  // 黑名单
  if (data.inControll) {
    commit('saveBlacklist', data);
  }
}

export default {
  namespaced: true,
  state: {
    imgList: [],
    imgIdList: [], // 图片列表的id
    imgListUpdateIndex: 0, // 图片更新列表人员更新后的index
    cameraList: {}, // 摄像头数据
    cameraIdList: [], // 摄像头位置列表
    cameraTypeList: {}, // 摄像头状态
    cameraTimer: null, // 摄像头计时器
    analysisList: [], // 正常数据
    analysisIdList: [], // 正常数据ID列表
    blacklist: [], // 黑名单
    blacklistId: [] // 黑名单ID
  },
  mutations: {
    saveImgList(state, json) {
      // 更新处理
      if (state.imgIdList.length > 0 && state.imgIdList.indexOf(json.plateNo) != 0) {
        let _length = state.imgList.length;

        state.imgList.splice(1, state.imgListUpdateIndex)
        state.imgIdList.splice(1, state.imgListUpdateIndex)
        state.imgListUpdateIndex = 0;
      } else {
        state.imgListUpdateIndex++;
      }

      state.imgList.splice(0, 0, {
        id: json.keyTime,
        url: json.passImage,
        inControll: json.inControll,
        plateNo: json.plateNo
      });
      state.imgIdList.splice(0, 0, json.plateNo);

      // 超出清理
      if (state.imgList.length > 30) {
        state.imgList.splice(30, state.imgList.length);
      }
    },
    saveAnalysisList(state, json) {
      let _index = state.analysisIdList.indexOf(json.plateNo);

      if (_index >= 0) {// 人员已存在做去重处理
        if (_index == 0) {// 该人员在第一条
          // 重复提示
          json.elastic = true;
          // 更新信息
          state.analysisList.splice(_index, 1, json);
        } else {// 人员不在第一条，把该人员移动到第一条
          // 先删除
          state.analysisList.splice(_index, 1);
          state.analysisIdList.splice(_index, 1);
          // 后添加
          state.analysisList.splice(0, 0, json);
          state.analysisIdList.splice(0, 0, json.plateNo);
        }
      } else { // 人员不存在直接添加人员
        state.analysisIdList.splice(0, 0, json.plateNo);
        state.analysisList.splice(0, 0, json);
      }

      // 超出清理
      if (state.analysisList.length > 20) {
        state.analysisList.splice(20, state.analysisList.length);
        state.analysisIdList.splice(20, state.analysisIdList.length);
      }
    },
    saveCameraList(state, json) {
      let _list = state.cameraList[json.autoParkId];
      // 删除多余数据
      if (_list.length > 2) {
        _list.splice(0, _list.length - 2);
      }

      _list.push({
        id: json.keyTime,
        inControll: json.inControll,
        url: json.passImage,
        imageTime: json.passTime,
        plateNo: json.plateNo
      });
      // 设置摄像头状态
      state.cameraTypeList[json.autoParkId] = json.inControll;
      clearTimeout(state.cameraTimer);
      state.cameraTimer = setTimeout(() => {
        _list.splice(0, _list.length - 1);
      }, 4000);
    },
    saveCameraIdList(state, arr) {
      // 保存id
      state.cameraIdList = arr;
      // 初始化摄像头相关json
      arr.map(item => {
        if (!state.cameraList[item]) {
          // 初始化对应摄像头数据
          state.cameraList[item] = [];
          // 初始化对应摄像头状态
          state.cameraTypeList[item] = false;
        }
      });
    },
    saveBlacklist(state, json) {
      let _index = state.blacklistId.indexOf(json.plateNo);

      if (_index >= 0) {// 人员已存在做去重处理
        if (_index == 0) {// 该人员在第一条
          // 重复提示
          json.elastic = true;
          // 更新信息
          state.blacklist.splice(_index, 1, json);
        } else {// 人员不在第一条，把该人员移动到第一条
          // 先删除
          state.blacklist.splice(_index, 1);
          state.blacklistId.splice(_index, 1);
          // 后添加
          state.blacklist.splice(0, 0, json);
          state.blacklistId.splice(0, 0, json.plateNo);
        }
      } else { // 人员不存在直接添加人员
        state.blacklistId.splice(0, 0, json.plateNo);
        state.blacklist.splice(0, 0, json);
      }

      // 超出清理
      if (state.blacklist.length > 20) {
        state.blacklist.splice(20, state.blacklist.length);
        state.blacklistId.splice(20, state.blacklistId.length);
      }
    }
  },
  actions: {
    async init({ state, commit }, list) {
      for (var i = 0; i < list.length; i++) {
        await dataArrange(state, commit, list[i], (new Date().getTime() + i))
      }
    },
    async push({ state, commit }, data) {
      await dataArrange(state, commit, data, new Date().getTime())
    },
    async setCamera({ commit }, arr) {
      commit("saveCameraIdList", arr);
    },
    async saveBlacklist({ commit }, arr) {
      arr.map(item => {
        commit('saveBlacklist', item);
      })
    },
    async reset({ state }) {
      state.imgList = [];
      state.imgIdList = []; // 图片列表的id
      state.imgListUpdateIndex = 0; // 图片更新列表人员更新后的index
      state.cameraList = {}; // 摄像头数据
      state.cameraIdList = []; // 摄像头位置列表
      state.cameraTypeList = {}; // 摄像头状态
      state.cameraTimer = null;
      state.analysisList = []; // 正常数据
      state.analysisIdList = []; // 正常数据ID列表
      state.blacklist = []; // 黑名单
      state.blacklistId = []; // 黑名单Key
    }
  }
}
