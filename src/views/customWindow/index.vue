<template>
  <div class="edit-window-main">
    <div class="module-list">
      <!-- swiper -->
      <swiper class="swiper" ref="swiper" :options="swiperOption">
        <swiper-slide v-for="(item,index) in modules" :key="index">
          <div class="box" :class="{sel: viewModules.includes(item)}" @click="onClickModule(item)">
            <component :is="item" />
            <i class="el-icon-check"></i>
            <div class="mask"></div>
          </div>
        </swiper-slide>
      </swiper>
    </div>
    <div class="property">
      <el-form ref="propertyForm" label-width="50px" v-if="currentModule">
        <div class="title">属性设置</div>
        <el-form-item label="宽度">
          <el-input v-model="propertyForm.width" @input="onPropertyChange($event, 'width')">
            <template slot="append">像素</template>
          </el-input>
        </el-form-item>
        <el-form-item label="高度">
          <el-input v-model="propertyForm.height" @input="onPropertyChange($event, 'height')">
            <template slot="append">像素</template>
          </el-input>
        </el-form-item>
        <el-form-item label="X轴">
          <el-input v-model="propertyForm.left" @input="onPropertyChange($event, 'left')">
            <template slot="append">像素</template>
          </el-input>
        </el-form-item>
        <el-form-item label="Y轴">
          <el-input v-model="propertyForm.top" @input="onPropertyChange($event, 'top')">
            <template slot="append">像素</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div class="btns">
        <el-tooltip placement="top">
          <div slot="content">查看效果</div>
          <div class="btn" @click="onLook">
            <svg-icon icon-class="client" />
          </div>
        </el-tooltip>
      </div>
    </div>
    <div class="main" ref="main" :class="{'show':mainStyle}" :style="mainStyle">
      <div class="view" ref="view">
        <div class="item" :class="{sel: item === currentModule}" @mousedown="currentModule = item" :style="moduleProperty[item]" v-for="(item,index) in viewModules" :key="index">
          <component :is="item" :styles="moduleProperty[item]" class="component" />
          <resizable :data.sync="moduleProperty[item]" :scale="viewScale" :el="$refs.view" />
          <div class="mask"></div>
        </div>
      </div>
    </div>
    <i class="close el-icon-close" @click="onClose" v-if="mainStyle"></i>
  </div>
</template>
<script>
import "swiper/dist/css/swiper.css";
import { swiper, swiperSlide } from "vue-awesome-swiper";

import { debounce } from "@/utils";

export default {
  name: "customWindow",
  components: {
    swiper,
    swiperSlide,
    // 自定组件
    Resizable: () => import("./components/Resizable"),
    // 模块
    Chart: () => import("./modules/Chart")
  },
  data() {
    return {
      // 基础模块
      modules: ["Chart"],
      // 模块属性
      moduleProperty: {},
      // 视图展示模块
      viewModules: [],
      // 当前选中模块
      currentModule: null,
      // 视图缩放
      viewScale: 0,
      // 主模块样式
      mainStyle: null,
      // 主模块缩放处理
      mainResizeFun: null,

      swiperOption: {
        slidesPerView: "auto",
        centeredSlides: true,
        spaceBetween: 5,
        freeMode: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev"
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true
        }
      }
    };
  },
  computed: {
    swiper() {
      return this.$refs.swiper.swiper;
    },
    propertyForm() {
      let _json = this.moduleProperty[this.currentModule];
      let _form = {};

      _json &&
        Object.keys(_json).map(item => {
          _form[item] = parseInt(_json[item]) || null;
        });
      return _form;
    }
  },
  mounted() {
    let _resizeFun = debounce(() => {
      this.viewZoom();
    }, 100);
    _resizeFun();
    window.addEventListener("resize", _resizeFun);

    this.swiper.slideTo(parseInt(this.modules.length / 2), 0, false);
  },
  methods: {
    // 视图缩放控制
    viewZoom() {
      if (!this.$refs.view || !this.$refs.main) return;

      this.viewScale = Math.min(
        this.$refs.main.clientWidth / 1920,
        this.$refs.main.clientHeight / 1080
      );
      this.$refs.view.style.transform = `scale(${this.viewScale})`;
    },
    // 点击模块处理
    onClickModule(item) {
      let _index = this.viewModules.indexOf(item);
      if (_index < 0) {
        this.currentModule = item;
        this.viewModules.push(item);

        // 如果属性初始化添加组件，为其初始化样式
        if (!this.moduleProperty[item]) {
          this.$set(this.moduleProperty, item, {
            top: "440px",
            left: "810px",
            width: "300px",
            height: "200px"
          });
        }
      } else {
        this.currentModule = null;
        this.viewModules.splice(_index, 1);
      }
    },
    // 属性更新
    onPropertyChange(value, key) {
      let _val = value.replace(/[^-?\d]/g, "") || 0;

      this.$set(this.moduleProperty[this.currentModule], key, _val + "px");
    },
    // 查看效果
    onLook() {
      if (!this.mainResizeFun) {
        this.mainResizeFun = debounce(() => {
          let _xy = [this.$el.clientWidth / 1920, this.$el.clientHeight / 1080];
          this.mainStyle = {
            top: 0,
            left: 0,
            width: "1920px",
            height: "1080px",
            zIndex: 999,
            transform: `scale(${_xy.join(",")})`,
            transformOrigin: "left top"
          };
        }, 50);
      }
      this.mainResizeFun();
      window.addEventListener("resize", this.mainResizeFun);
      window.dispatchEvent(new Event("resize"));
    },
    // 关闭查看
    onClose() {
      this.mainStyle = null;
      window.removeEventListener("resize", this.mainResizeFun);
      window.dispatchEvent(new Event("resize"));
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@/styles/customWindow.scss";
</style>