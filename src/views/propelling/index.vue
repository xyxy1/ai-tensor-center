<template>
  <el-tabs type="border-card" class="app-container" @tab-click="onTabsChange" v-model="tabsActive">
    <el-tab-pane label="门禁推送" name="doorManage">
      <door-manage ref="doorManage" />
    </el-tab-pane>
    <el-tab-pane label="APP推送" name="appManage">
      <app-manage ref="appManage" />
    </el-tab-pane>
    <el-tab-pane label="短信推送" name="smsManage">
      <sms-manage ref="smsManage" />
    </el-tab-pane>
    <el-tab-pane label="客户端推送" name="clientManage">
      <client-manage ref="clientManage" />
    </el-tab-pane>
  </el-tabs>
</template>
<script>
export default {
  name: "propelling",
  components: {
    DoorManage: () => import("./components/DoorManage"),
    AppManage: () => import("./components/AppManage"),
    SmsManage: () => import("./components/SmsManage"),
    ClientManage: () => import("./components/ClientManage")
  },
  data: () => ({
    tabsActive: "doorManage",
    initState: {
      doorManage: true,
      appManage: false,
      smsManage: false,
      clientManage: false
    }
  }),
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
  height: 100%;
  /deep/ {
    .el-tabs__content {
      padding: 0;
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
  }
}
</style>