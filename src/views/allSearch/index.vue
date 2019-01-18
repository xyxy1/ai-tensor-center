<template>
  <div class="app-container">
    <template v-if="data">
      <el-tabs type="border-card" @tab-click="onTabsChange" v-model="tabsActive">
        <el-tab-pane label="人员属性" name="labelDetails">
          <label-details ref="labelDetails" :data="data" />
        </el-tab-pane>
        <el-tab-pane label="抓拍记录" name="historyData">
          <history-data ref="historyData" :data="data" />
        </el-tab-pane>
        <el-tab-pane label="尾随记录" name="dangleAfterData">
          <dangle-after-data ref="dangleAfterData" :data="data" />
        </el-tab-pane>
        <el-tab-pane label="同行记录" name="togetherGroupData">
          <together-group-data ref="togetherGroupData" :data="data" />
        </el-tab-pane>
      </el-tabs>
      <el-button size="mini" type="success" class="btn" @click="onOpenLayer">查看轨迹</el-button>
    </template>
    <div class="null" v-if="!data">暂无数据</div>

    <!-- 以图搜图 - 弹窗 -->
    <picture-layer ref="pictureLayer" jump />
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  name: "allSearch",
  components: {
    LabelDetails: () => import("./components/LabelDetails"),
    HistoryData: () => import("./components/HistoryData"),
    DangleAfterData: () => import("./components/DangleAfterData"),
    TogetherGroupData: () => import("./components/TogetherGroupData")
  },
  data: () => ({
    tabsActive: "labelDetails",
    initState: {
      labelDetails: true,
      historyData: false,
      dangleAfterData: false,
      togetherGroupData: false
    }
  }),
  computed: {
    ...mapGetters({
      data: "allSearch/getData"
    })
  },
  watch: {
    data() {
      this.initData();
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      if (this.data) {
        this.tabsActive = "labelDetails";
        this.initState = {
          labelDetails: true,
          historyData: false,
          dangleAfterData: false,
          togetherGroupData: false
        };
        this.initRecursion();
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
    },
    onTabsChange(tab) {
      this.tabsActive = tab.name;
      // 判断是否需要初始化
      if (!this.initState[this.tabsActive]) {
        this.initState[this.tabsActive] = true;
        this.$refs[this.tabsActive].init && this.$refs[this.tabsActive].init();
      }
    },
    onOpenLayer() {
      this.$refs.pictureLayer.open({
        keyword: this.data.identityNo,
        image: this.data.identityImg.includes(".")
          ? this.data.identityImg
          : "data:image/jpeg;base64," + this.data.identityImg
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  position: relative;
  height: 100%;
  .null {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    line-height: 40px;
    margin: -20px 0 0 -200px;
    text-align: center;
    font-size: 16px;
    color: #999;
  }
  .btn {
    position: absolute;
    top: 10px;
    right: 15px;
    width: 100px;
  }
  .el-tabs {
    position: relative;
    height: 100%;
  }
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