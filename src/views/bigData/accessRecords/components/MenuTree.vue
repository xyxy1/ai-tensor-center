<template>
  <el-col :span="6" class="menu-tree">
    <div class="title">
      <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText" clearable></el-input>
    </div>
    <el-tree ref="menuTree" class="menu" :data="menuData" :filter-node-method="filterNode" node-key="id" highlight-current :expand-on-click-node="false">
      <div class="menu-item" :class="{sel:currentRow.communityCode+''+currentRow.accessCode == data.communityCode+''+data.accessCode, children:!data.children}" slot-scope="{ node, data }" @click="onMenuClick(data)">
        <svg-icon :icon-class="data.communityId?'dashboard':'doorLinkage'" />
        <span>{{ data.communityId?data.communityName:data.accessName }}</span>
      </div>
    </el-tree>
  </el-col>
</template>
<script>
import { getCommunityTree } from "@/api/bigData/accessRecords";
export default {
  data: () => ({
    filterText: "",
    menuData: null,
    currentRow: null,
    currentIndex: 0
  }),
  watch: {
    filterText(val) {
      this.$refs.menuTree.filter(val);
    }
  },
  created() {
    this.menuList();
  },
  methods: {
    menuList() {
      getCommunityTree().then(res => {
        this.menuData = res.data;
        this.currentRow = this.menuData[this.currentIndex];
        this.$emit("change", this.currentRow);
      });
    },
    onMenuClick(row) {
      this.currentRow = row;

      this.$emit("change", this.currentRow);
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    }
  }
};
</script>
<style lang="scss" scoped>
.menu-tree {
  background: #fafbfd;
  border-right: 1px solid #e1e1e1;
  .title {
    height: 46px;
    line-height: 46px;
    padding: 0 10px 0 16px;
    font-size: 14px;
    color: #333;
    .el-button {
      float: right;
      margin-top: 10px;
    }
  }
  .menu {
    background: transparent;
    height: calc(100% - 46px);
    padding: 0 6px;
    overflow: auto;
    border-top: 1px solid #e1e1e1;
    font-size: 13px;
    color: #333;
    .menu-item {
      display: flex;
      width: 100%;
      height: 100%;
      padding: 0 26px 0 6px;
      &.sel {
        background: #d5e6f9;
      }
      &.children {
        padding: 0 6px 0 16px;
      }
      span {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .svg-icon {
        display: inline-block;
        height: 100%;
        margin-right: 6px;
        vertical-align: top;
        font-size: 16px;
        color: #b5c0cd;
      }
    }
    /deep/ {
      .el-tree-node.is-current {
        & > .el-tree-node__content {
          background-color: #d5e6f9;
        }
      }
      .el-icon-caret-right {
        position: absolute;
        right: 0;
        top: 50%;
        margin: -15px 0 0;
        font-size: 16px;
      }
      .el-tree-node__content {
        position: relative;
        height: 39px;
        line-height: 38px;
        padding: 0 !important;
        border-bottom: 1px solid #edeff3;
        &:hover {
          background: #d5e6f9;
        }
      }
    }
  }
}
</style>