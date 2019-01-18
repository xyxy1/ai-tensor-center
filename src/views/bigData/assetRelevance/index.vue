<template>
  <div class="app-container">
    <el-row class="main">
      <menu-tree ref="menu" @change="onMenuChange" />
      <el-col :span="18" class="right-box">
        <el-tabs type="border-card" v-model="tabsActive">
          <el-tab-pane label="人员信息" name="labelManage">
            <label-manage ref="labelManage" :data="currentRow" />
          </el-tab-pane>
          <el-tab-pane label="车辆信息" name="carManage">
            <car-manage ref="carManage" :data="currentRow" />
          </el-tab-pane>
          <el-tab-pane label="物业缴费" name="propertyManage" v-if="currentRow.type == 3 && false">
            <property-manage ref="propertyManage" :data="currentRow" />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: "infoRelevance",
  components: {
    MenuTree: () => import("./components/MenuTree"),
    LabelManage: () => import("./components/LabelManage"),
    CarManage: () => import("./components/CarManage"),
    PropertyManage: () => import("./components/PropertyManage")
  },
  data: () => ({
    currentRow: {},
    tabsActive: "labelManage"
  }),
  methods: {
    onMenuChange(row) {
      this.currentRow = row;
      this.tabsActive = "labelManage";
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container,
.main {
  height: 100%;
  & > .el-col {
    height: 100%;
  }
  .w100 {
    width: 100%;
  }

  /* 标签切换 */
  .el-tabs {
    position: relative;
    height: 100%;
    border: 0;
    box-shadow: none;
    /deep/ {
      .el-tabs__content {
        padding: 0;
      }
      .el-tabs__header {
        background: #fafbfd;
      }
      .el-tabs__item {
        width: 120px;
        height: 48px;
        line-height: 47px;
        padding: 0 !important;
        border-right: 1px solid #e4e5e6;
        text-align: center;
        font-size: 14px;
        color: #666;
        &.is-active {
          background: #fff;
          font-weight: bold;
          color: #353535;
        }
      }
    }
  }
}
</style>