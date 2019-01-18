import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import errorLog from './modules/errorLog';
import permission from './modules/permission';
import tagsView from './modules/tagsView';
import user from './modules/user';
import camera from './modules/camera';
import data from './modules/data';
import terminal from './modules/terminal';
import cluster from './modules/cluster';
import analysis from './modules/analysis';
import realTimeSnapshot from './modules/realTimeSnapshot';
import allSearch from './modules/allSearch';
import carBigData from './modules/carBigData';
import getters from './getters';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    errorLog,
    permission,
    tagsView,
    user,
    camera,
    data,
    terminal,
    cluster,
    analysis,
    realTimeSnapshot,
    allSearch,
    carBigData
  },
  getters
});

export default store
