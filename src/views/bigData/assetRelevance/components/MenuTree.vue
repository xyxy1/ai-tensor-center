<template>
  <el-col :span="6" class="menu-tree">
    <div class="title">
      <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText" clearable></el-input>
    </div>
    <el-tree ref="menuTree" class="menu" :data="menuData" :filter-node-method="filterNode" node-key="id" highlight-current :expand-on-click-node="false">
      <div class="menu-item" slot-scope="{ node, data }" @click="onMenuClick(data)">
        {{ data.communityId?data.communityName:data.label }}
      </div>
    </el-tree>
  </el-col>
</template>
<script>
import { getCommunityTree } from "@/api/bigData/community";
export default {
  data: () => ({
    filterText: "",
    menuData: null,
    currentRow: null
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
      flex: 1;
      height: 100%;
    }
    /deep/ {
      .el-tree-node.is-current {
        & > .el-tree-node__content {
          background-color: #d5e6f9;
        }
      }
      .el-tree-node__content {
        display: flex;
        &:hover {
          background-color: #e7eff8;
        }
        .el-tree-node__expand-icon {
          margin-top: 0;
        }
      }
    }
  }
}
</style>