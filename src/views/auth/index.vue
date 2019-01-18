<template>
  <div class="app-container">
    <el-tabs value="service">
      <el-tab-pane label="服务权限管理" name="service">
        <service />
      </el-tab-pane>
      <el-tab-pane label="网关路由管理" name="gateway">
        <gateway-route />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: "service-manage",
  components: {
    service: () => import("./service"),
    "gateway-route": () => import("./gatewayRoute")
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

