<template>
  <div class="app-container">
    <department-menu @change="onMenuChange" />
    <el-col :span="18">
      <el-tabs type="border-card" v-model="tabsActive">
        <!-- 用户管理 -->
        <el-tab-pane label="用户管理" name="user" v-permission="'userMan:view_user'">
          <user-configure :departId="currentMenu.id" />
        </el-tab-pane>

        <!-- 岗位管理 -->
        <el-tab-pane label="岗位管理" name="position" v-permission="'userMan:view_position'">
          <position-configure :departId="currentMenu.id" />
        </el-tab-pane>

        <!-- 角色管理 -->
        <el-tab-pane label="角色管理" name="group" v-permission="'userMan:view_group'">
          <role-configure :departId="currentMenu.id" />
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </div>
</template>
<script>
export default {
  name: "userManage",
  components: {
    DepartmentMenu: () => import("./components/DepartmentMenu"),
    UserConfigure: () => import("./components/UserConfigure"),
    PositionConfigure: () => import("./components/PositionConfigure"),
    RoleConfigure: () => import("./components/RoleConfigure")
  },
  data() {
    return {
      currentMenu: {},
      tabsActive: "user"
    };
  },
  methods: {
    onMenuChange(data) {
      this.currentMenu = data;
    }
  }
};
</script>
<style lang="scss">
.app-container {
  height: 100%;
  & > .el-col {
    height: 100%;
  }

  /* 标签切换 */
  .el-tabs {
    position: relative;
    height: 100%;
    border: 0;
    box-shadow: none;
    /deep/ {
      .el-tabs__item {
        height: 48px;
        line-height: 47px;
      }
      .el-tabs__content {
        height: calc(100% - 48px);
        padding: 0;
      }
    }
  }
}
</style>