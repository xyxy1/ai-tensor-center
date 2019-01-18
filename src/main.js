import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import Element from 'element-ui'
import '@/styles/index.scss' // global css
import 'vue-croppa/dist/vue-croppa.css'
// 自定义主题
import './styles/element-variables.scss';
import App from './App'
import router from './router'
import store from './store'

import i18n from './lang' // Internationalization
import './icons' // icon
import './errorLog' // error log
import './permission' // permission control
// import './mock' // simulation data
import Croppa from 'vue-croppa'
import ZkTable from 'vue-table-with-tree-grid'
import ImgShow from '@/common/component/ImgShow'
import AudioButton from '@/common/component/AudioButton'
import DictSelect from '@/common/component/DictSelect'
import Permission from '@/common/component/Permission'
import MapLocation from '@/common/component/MapLocation'
import PictureSearch from '@/common/component/PictureSearch'
import PictureLayer from '@/common/component/PictureLayer'
import PicList from '@/common/component/PicList'
import MlphSelect from '@/common/component/MlphSelect'
import Gestures from '@/common/component/Gestures'
import * as filters from './filters' // global filters
//import 'element-ui/lib/theme-chalk/index.css'
Vue.component(ZkTable.name, ZkTable);

Vue.component('img-show', ImgShow);
Vue.component('audio-button', AudioButton);
Vue.component('dict-select', DictSelect);
Vue.component('map-location', MapLocation);
Vue.component('picture-search', PictureSearch);
Vue.component('picture-layer', PictureLayer);
Vue.component('pic-list', PicList);
Vue.component('mlph-select', MlphSelect);

Vue.use(Permission);
Vue.use(Gestures);
Vue.use(Croppa);
Vue.use(Element, {
  size: 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

// 全局参数
import { colorBrightness } from "@/utils";
Vue.prototype.colorBrightness = colorBrightness;

// 自定义localstorage
import AiStore from '@/utils/store';
Vue['aiStore'] = AiStore;
Vue.prototype['$aiStore'] = AiStore;

new Vue({
  el: "#app",
  router,
  store,
  i18n,
  template: "<App/>",
  components: { App }
})