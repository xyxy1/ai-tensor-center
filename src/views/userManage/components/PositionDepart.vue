<template>
  <el-dialog title="数据授权" class="position-depart" :visible.sync="isDepartDialog" width="500px">
    <el-input placeholder="输入关键字进行过滤" v-model="filterText" />
    <el-tree class="filter-tree" node-key="id" :data="treeData" show-checkbox :expand-on-click-node="false" highlight-current :props="defaultProps" :filter-node-method="filterNode" ref="departTree" @node-click="getNodeData" default-expand-all>
      <div class="tree-item" slot-scope="{ node, data }">{{node.label}}</div>
    </el-tree>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="onSubmit">保存</el-button>
      <el-button size="mini" @click="isDepartDialog = false">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  getDepartmentTree,
  postPositionDepartment,
  getPositionDepartment
} from "@/api/userManage";

export default {
  props: {
    positionId: {
      default: null
    },
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      filterText: "",
      listQuery: {
        name: undefined
      },
      treeData: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      isDepartDialog: false
    };
  },
  watch: {
    isOpen(val) {
      this.isDepartDialog = val;
      this.$refs.departTree && this.$refs.departTree.setCheckedKeys([]);
    },
    isDepartDialog(val) {
      this.$emit("update:isOpen", val);

      if (val) {
        this.init();
      }
    },
    filterText(val) {
      this.$refs.departTree.filter(val);
    }
  },
  methods: {
    init() {
      getDepartmentTree(this.listQuery).then(res => {
        this.treeData = res.data;
        this.initDeparts();
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
    onSubmit() {
      postPositionDepartment(this.positionId, {
        departs: this.$refs.departTree.getCheckedKeys().join()
      }).then(res => {
        this.$refs.departTree.setCheckedKeys([]);
        let isSuccess = res.status === 200;
        // 提示处理
        this.$notify({
          title: isSuccess ? "成功" : "失败",
          message: isSuccess ? "数据授权成功" : res.message,
          type: isSuccess ? "success" : "error",
          duration: 2000
        });

        if (isSuccess) this.isDepartDialog = false;
      });
    },
    initDeparts() {
      getPositionDepartment(this.positionId).then(res => {
        const result = [];
        for (let i = 0; i < res.data.length; i++) {
          result.push(res.data[i].id);
        }
        this.$refs.departTree.setCheckedKeys(result);
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.filter-tree {
  margin-top: 10px;
}
</style>
