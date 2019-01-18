<template>
  <el-dialog class="role-authority body0" title="权限下发" :visible.sync="isAuthorizeDialog" width="1000px">
    <el-row>
      <el-col :span="6" class="menu">
        <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>
        <el-tree class="filter-tree" check-strictly :data="treeData" :show-checkbox="editable" node-key="id" :expand-on-click-node="false" highlight-current :props="defaultProps" :filter-node-method="filterNode" ref="menuTree" @node-click="getNodeData" default-expand-all>
          <div class="tree-item" slot-scope="{ node, data }">{{node.label}}</div>
        </el-tree>
      </el-col>
      <el-col :span="18">
        <el-table class="list-table" height="calc(100vh - 400px)" ref="elementTable" :data="list" border fit highlight-current-row @select="handleSelectionChange" @select-all="handleSelectionAll" style="width: 100%">
          <el-table-column v-if="editable" type="selection" width="55" />
          <el-table-column align="center" label="资源类型" prop="type" />
          <el-table-column align="center" label="资源名称" prop="name" />
          <el-table-column align="center" label="资源地址" prop="url" />
          <el-table-column align="center" label="资源请求类型" prop="method" />
        </el-table>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer" v-if="editable">
      <el-button size="mini" type="primary" @click="onUpdate" v-permission="'groupMan:modifyMenuAuthorize'">保 存</el-button>
      <el-button size="mini" @click="isAuthorizeDialog = false">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  deleteRoleResourceAuthorize,
  postRoleResourceAuthorize,
  postRoleMenuAuthorize,
  getRoleMenuTree,
  getRoleMenuResourceList
} from "@/api/userManage";

export default {
  props: {
    groupId: {
      type: [String, Number]
    },
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      editable: false,
      isAuthorizeDialog: false,
      filterText: "",
      list: null,
      total: null,
      listQuery: {
        name: null
      },
      treeData: [],
      defaultProps: {
        children: "children",
        label: "title"
      }
      //   currentId: -1
    };
  },
  watch: {
    isOpen(val) {
      this.isAuthorizeDialog = val;
    },
    isAuthorizeDialog(val) {
      this.$emit("update:isOpen", val);

      if (val) {
        this.getList();
      } else {
        this.list = null;
        this.treeData = [];
      }
    },
    filterText(val) {
      this.$refs.menuTree.filter(val);
    }
  },
  methods: {
    getList() {
      getRoleMenuTree(this.groupId, 1).then(res => {
        this.treeData = res.data.authorizeList;
        this.editable = res.data.editable;
        this.$refs.menuTree.setCheckedKeys(res.data.selected);
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    getNodeData(data) {
      this.listQuery.menuId = data.id;
      getRoleMenuResourceList(this.groupId, 1, this.listQuery).then(res => {
        this.list = res.data.authorizeList;

        this.$nextTick(() => {
          this.list.map(item => {
            if (res.data.selected.indexOf(item.id) >= 0) {
              this.$refs.elementTable.toggleRowSelection(item);
            }
          });
        });
      });
      this.currentId = data.id;
      this.showElement = true;
    },
    getTreeNodeKey(node) {
      return node.id;
    },
    handleSelectionChange(val, row) {
      let flag = true;
      for (let i = 0; i < val.length; i++) {
        if (val[i].id === row.id) {
          postRoleResourceAuthorize(this.groupId, {
            // menuId: this.currentId,
            elementId: row.id
          }).then(() => {
            this.$notify({
              title: "成功",
              message: "资源权限添加成功",
              type: "success",
              duration: 2000
            });
          });
          flag = false;
          break;
        }
      }
      if (flag) {
        deleteRoleResourceAuthorize(this.groupId, {
          // menuId: this.currentId,
          elementId: row.id
        }).then(res => {
          let isSuccess = res.status === 200;
          // 提示处理
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "资源权限移除成功" : res.message,
            type: isSuccess ? "success" : "error",
            duration: 2000
          });
        });
      }
    },
    handleSelectionAll(val) {
      if (val.length === 0 && this.list !== null) {
        for (let i = 0; i < this.list.length; i++) {
          deleteRoleResourceAuthorize(this.groupId, {
            // menuId: this.currentId,
            elementId: this.list[i].id
          }).then(res => {
            let isSuccess = res.status === 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "资源权限移除成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });
          });
        }
      } else {
        for (let i = 0; i < val.length; i++) {
          postRoleResourceAuthorize(this.groupId, {
            // menuId: this.currentId,
            elementId: val[i].id
          }).then(res => {
            let isSuccess = res.status === 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "资源权限添加成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });
          });
        }
      }
    },
    onUpdate() {
      this.$emit("closeAuthorityDialog");
      const nodes = this.$refs.menuTree.getCheckedNodes();
      const ids = [];
      for (let i = 0; i < nodes.length; i++) {
        ids.push(nodes[i].id);
      }
      postRoleMenuAuthorize(this.groupId, {
        menuTrees: ids.join()
      }).then(res => {
        let isSuccess = res.status === 200;
        // 提示处理
        this.$notify({
          title: isSuccess ? "成功" : "失败",
          message: isSuccess ? "菜单权限保存成功" : res.message,
          type: isSuccess ? "success" : "error",
          duration: 2000
        });

        if (isSuccess) this.isAuthorizeDialog = false;
      });
    },
    tableValidate() {
      const nodes = this.$refs.menuTree.getCheckedNodes();
      const ids = [];
      for (let i = 0; i < nodes.length; i++) {
        ids.push(nodes[i].id);
      }

      return ids.indexOf(this.currentId) < 0;
    }
  }
};
</script>
<style lang="scss" scoped>
.role-authority {
  .title {
    margin-bottom: 10px;
  }
  .menu {
    padding: 10px;
    border-right: 1px #e1e1e1 solid;
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
  .list-table {
    width: 100%;
  }
}
</style>
