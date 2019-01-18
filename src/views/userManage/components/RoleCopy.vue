<template>
  <el-dialog class="role-copy body0" title="角色复制" :visible.sync="isCopyDialog" width="1000px">
    <el-row>
      <el-col :span="12">
        <el-table height="calc(100vh - 400px)" :data="listTableData" v-loading.body="listLoading" highlight-current-row @select="onSelectionChange" @select-all="onSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column align="center" label="角色名称" prop="groupName" />
          <el-table-column fixed="right" align="center" label="备注" prop="description" />
        </el-table>
      </el-col>
      <el-col :span="12" class="menu">
        <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText" />
        <el-tree class="filter-tree" node-key="id" :data="treeData" show-checkbox :expand-on-click-node="false" highlight-current :props="defaultProps" :filter-node-method="filterNode" ref="departTree" @node-click="getNodeData" default-expand-all>
          <div class="tree-item" slot-scope="{ node, data }">{{node.label}}</div>
        </el-tree>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="onSubmit">保 存</el-button>
      <el-button size="mini" @click="isCopyDialog = false">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  getDepartmentTree,
  getRoleCopyList,
  postRoleCopy
} from "@/api/userManage";

export default {
  props: {
    departId: {
      type: [String, Number],
      default: null
    },
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      listLoading: false,
      listTableQuery: {
        groupName: null,
        departId: null,
        groupType: "share"
      },
      listTableData: [],

      copyQuery: {
        groupIds: null,
        departIds: null
      },

      filterText: "",
      listQuery: {
        name: undefined
      },
      treeData: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      isCopyDialog: false
    };
  },
  watch: {
    isOpen(val) {
      this.isCopyDialog = val;
      this.$refs.departTree && this.$refs.departTree.setCheckedKeys([]);
      this.copyQuery = {
        groupIds: null,
        departIds: null
      };
    },
    isCopyDialog(val) {
      this.$emit("update:isOpen", val);

      if (val) {
        this.getList();
      }
    },
    filterText(val) {
      this.$refs.departTree.filter(val);
    }
  },
  methods: {
    getList() {
      if (!this.departId) {
        this.$notify({
          title: "提示",
          message: "请先选择部门节点！",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.listTableQuery.departId = this.departId;
      this.listLoading = true;
      getRoleCopyList(this.listTableQuery)
        .then(res => {
          this.listTableData = res.data;
        })
        .finally(() => {
          this.listLoading = false;
        });

      getDepartmentTree(this.listQuery).then(res => {
        if (res.status == 200) {
          this.treeData = res.data;
        }
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    getNodeData(data) {
      this.listQuery.menuId = data.id;
      this.currentId = data.id;
      this.showElement = true;
    },
    onSelectionChange(val) {
      this.copyQuery.groupIds = val.map(item => item.id).join(",");
    },
    onSubmit() {
      const nodes = this.$refs.departTree.getCheckedNodes();
      this.copyQuery.departIds = nodes.map(item => item.id).join(",");
      postRoleCopy(this.copyQuery).then(res => {
        this.$refs.departTree.setCheckedKeys([]);
        let isSuccess = res.status === 200;
        // 提示处理
        this.$notify({
          title: isSuccess ? "成功" : "失败",
          message: isSuccess ? "角色复制成功" : res.message,
          type: isSuccess ? "success" : "error",
          duration: 2000
        });

        if (isSuccess) this.isCopyDialog = false;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.role-copy {
  .menu {
    padding: 10px;
    border-left: 1px #e1e1e1 solid;
  }
  .filter-tree {
    height: calc(100vh - 456px);
    margin-top: 10px;
    overflow: auto;
    /deep/ .tree-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;
    }
  }
}
</style>
