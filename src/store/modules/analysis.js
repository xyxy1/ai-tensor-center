// 数据整理
function dataArrange(state, commit, data, key) {
  let _time = new Date().getTime(); // 时间戳，唯一标识
  let _isWarn = data.labelTypeCode.indexOf(8) >= 0;
  let _isFollow = data.nameLabelList && data.nameLabelList.length > 0;
  let _labelTypeArr = data.labelTypeCode.split(',');

  data.keyTime = _time;
  data.isWarn = _isWarn;
  data.isFollow = _isFollow;

  // // 临时特别处理。如果当前摄像头列表没有匹配到对应的id。放弃当前数据
  // if (state.cameraIdList.indexOf(data.cameraId) < 0) {
  //   return;
  // }

  // 保存摄像头数据
  if (state.cameraIdList.indexOf(data.cameraId) >= 0) {
    // 保存对应摄像头数据
    commit('saveCameraList', data);
  }

  // 图片列表滚动
  commit('saveImgList', {
    json: data,
    typeArr: _labelTypeArr
  });


  // 尾随处理
  if (_isFollow) {
    state.follow = data;
    // 定时清空，30秒
    clearTimeout(state.followTimer);
    state.followTimer = setTimeout(() => {
      state.follow = null;
    }, 30000);
  }

  // 黑名单处理
  if (_isWarn) {
    state.blacklist = data;
    commit('saveBlacklist', data);
    // 定时清空，60秒
    clearTimeout(state.blacklistTimer);
    state.blacklistTimer = setTimeout(() => {
      state.blacklist = null;
    }, 60000);//60000

    // 通用数据展示
    if (_labelTypeArr.length > 1) {
      commit('saveAnalysisList', data);
    }
  } else {
    if (data.labelTypeCode !== '4') {
      // 通用数据展示
      commit('saveAnalysisList', data);
    }
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
    follow: null, // 尾随
    followTimer: null, // 尾随计时器
    blacklist: null, // 黑名单
    blacklistTimer: null, // 黑名单计时器
    moreBlacklist: [], // 黑名单列表
    moreBlacklistId: [], // 黑名单列表KEY
    analysisList: [], // 正常数据
    analysisIdList: [] // 正常数据ID列表
  },
  mutations: {
    saveImgList(state, { json, typeArr }) {
      let _labelNameArr = json.labelTypeName.split(',');

      // 更新处理
      if (state.imgIdList.length > 0 && state.imgIdList.indexOf(json.labelNo) != 0) {
        let _length = state.imgList.length;

        state.imgList.splice(1, state.imgListUpdateIndex)
        state.imgIdList.splice(1, state.imgListUpdateIndex)
        state.imgListUpdateIndex = 0;
      } else {
        state.imgListUpdateIndex++;
      }

      state.imgList.splice(0, 0, {
        id: json.keyTime,
        url: json.faceImage,
        isWarn: json.isWarn,
        isFollow: json.isFollow,
        imageTime: json.imageTime,
        labelType: typeArr,
        labelName: _labelNameArr.map(item => item.substr(0, 1)).join('\\'),
        cameraName: json.cameraName
      });
      state.imgIdList.splice(0, 0, json.labelNo);

      // 超出清理
      if (state.imgList.length > 30) {
        state.imgList.splice(30, state.imgList.length);
      }
    },
    saveAnalysisList(state, json) {
      let _index = state.analysisIdList.indexOf(json.labelNo);

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
          state.analysisIdList.splice(0, 0, json.labelNo);
        }
      } else { // 人员不存在直接添加人员
        state.analysisIdList.splice(0, 0, json.labelNo);
        state.analysisList.splice(0, 0, json);
      }

      // 超出清理
      if (state.analysisList.length > 10) {
        state.analysisList.splice(10, state.analysisList.length);
        state.analysisIdList.splice(10, state.analysisIdList.length);
      }
    },
    saveCameraList(state, json) {
      let _list = state.cameraList[json.cameraId];
      // 删除多余数据
      if (_list.length > 2) {
        _list.splice(0, _list.length - 2);
      }

      _list.push({
        id: json.keyTime,
        isWarn: json.isWarn,
        url: json.faceImage,
        imageTime: json.imageTime
      });
      // 设置摄像头状态
      state.cameraTypeList[json.cameraId] = json.isWarn;
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
      let _index = state.moreBlacklistId.indexOf(json.labelNo);

      if (_index >= 0) {// 人员已存在做去重处理
        if (_index == 0) {// 该人员在第一条
          // 重复提示
          json.elastic = true;
          // 更新信息
          state.moreBlacklist.splice(_index, 1, json);
        } else {// 人员不在第一条，把该人员移动到第一条
          // 先删除
          state.moreBlacklist.splice(_index, 1);
          state.moreBlacklistId.splice(_index, 1);
          // 后添加
          state.moreBlacklist.splice(0, 0, json);
          state.moreBlacklistId.splice(0, 0, json.labelNo);
        }
      } else { // 人员不存在直接添加人员
        state.moreBlacklistId.splice(0, 0, json.labelNo);
        state.moreBlacklist.splice(0, 0, json);
      }

      // 超出清理
      if (state.moreBlacklist.length > 20) {
        state.moreBlacklist.splice(20, state.moreBlacklist.length);
        state.moreBlacklistId.splice(20, state.moreBlacklistId.length);
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
      state.follow = null; // 尾随
      state.followTimer = null; // 尾随计时器
      state.blacklist = null; // 黑名单
      state.blacklistTimer = null; // 黑名单计时器
      state.moreBlacklist = []; // 黑名单列表
      state.moreBlacklistId = []; // 黑名单列表KEY
      state.analysisList = []; // 正常数据
      state.analysisIdList = []; // 正常数据ID列表
    }
  }
}
