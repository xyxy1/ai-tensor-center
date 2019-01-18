<template>
  <div class="app-container">
    <el-tabs type="border-card" v-model="tabsActive" @tab-click="onTabsChange">
      <el-tab-pane label="菜单管理" name="menu">
        <menu-component ref="menu" />
      </el-tab-pane>
      <el-tab-pane label="数据字典" name="dict">
        <dict-component ref="dict" />
      </el-tab-pane>
      <el-tab-pane label="人脸参数配置" name="face">
        <face-component ref="face" />
      </el-tab-pane>
      <el-tab-pane label="提示音管理" name="sound">
        <sound-component ref="sound" />
      </el-tab-pane>
      <el-tab-pane label="中心同步" name="dataSync">
        <data-sync ref="dataSync" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "base-manager",
  data: () => ({
    tabsActive: "menu",
    initState: {
      menu: true,
      dict: false,
      face: false,
      sound: false,
      dataSync: false
    }
  }),
  components: {
    "menu-component": () => import("./menu"),
    "dict-component": () => import("../dict"),
    "face-component": () => import("../config/manager"),
    "sound-component": () => import("./sound"),
    "data-sync": () => import("./dataSync")
  },
  mounted() {
    this.initRecursion();
  },
  methods: {
    onTabsChange(tab) {
      this.tabsActive = tab.name;
      // 判断是否需要初始化
      if (!this.initState[this.tabsActive]) {
        this.initState[this.tabsActive] = true;
        this.$refs[this.tabsActive].init && this.$refs[this.tabsActive].init();
      }
    },
    initRecursion() {
      this.$nextTick(() => {
        if (this.$refs[this.tabsActive]) {
          this.$refs[this.tabsActive].init();
        } else {
          setTimeout(() => {
            this.initRecursion();
          }, 200);
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  position: relative;
  height: 100% !important;
  .el-tabs {
    height: 100% !important;
  }
  /deep/ {
    .el-tabs__content {
      height: calc(100% - 45px);
      padding: 0;
      overflow: auto;
    }
    .el-tabs__header {
      background: #fafbfd;
    }
    .el-tabs__item {
      width: 120px;
      height: 46px;
      line-height: 46px;
      padding: 0 !important;
      border-right: 1px solid #e4e5e6;
      text-align: center;
      font-size: 14px;
      color: #666;
      &.is-active {
        background: #eaeaea;
        font-weight: bold;
        color: #353535;
      }
    }
    .el-tab-pane {
      height: 100%;
    }
    .input-label {
      margin-right: 10px;
      font-size: 14px;
      font-weight: normal;
    }
    .el-tabs__active-bar {
      display: none;
    }
  }
}
</style>
