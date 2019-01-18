<template>
  <el-dialog title="门楼牌号" class="mlph-layer" :visible.sync="isMlphDialog" width="400px">
    <el-input placeholder="输入关键字进行过滤" v-model="filterName"></el-input>
    <el-tree ref="mlphTree" class="filter-tree" node-key="id" :data="treeData" show-checkbox check-strictly :filter-node-method="onFilterNode" @check-change="onTreeChange" :default-expanded-keys="treeExpandedKeys">
      <div class="tree-item" :class="{'disable-checkbox': disableType.includes(data.type)}" slot-scope="{ node, data }">
        <svg-icon icon-class="dashboard" />
        <span>{{ data.communityId?data.communityName:data.label }}</span>
      </div>
    </el-tree>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="onSubmit">确 定</el-button>
      <el-button size="mini" @click="isMlphDialog = false">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getCommunityTree } from "@/api/bigData/community";

export default {
  props: {
    data: Object,
    disableType: {
      type: Array,
      default: () => []
    },
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data: () => ({
    isMlphDialog: false,
    treeExpandedKeys: [],
    filterName: "",
    treeData: []
  }),
  watch: {
    isOpen(val) {
      this.isMlphDialog = val;
    },
    isMlphDialog(val) {
      this.$emit("update:isOpen", val);

      val && this.init();
    }
  },
  methods: {
    init() {
      getCommunityTree().then(res => {
        this.treeData = res.data;

        this.treeExpandedKeys = [];
        if (this.data.id) {
          this.treeExpandedKeys = [this.data.id];
          this.$refs.mlphTree.setCheckedKeys([this.data.id]);
        }
      });
    },
    // 选择部门相关
    onFilterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    onTreeChange(data, checked) {
      if (this.$refs.mlphTree.getCheckedKeys().length > 1 && checked) {
        this.$refs.mlphTree.setCheckedKeys([]);
        this.$refs.mlphTree.setCheckedKeys([data.id]);
      }
    },
    onSubmit() {
      let _arr = this.$refs.mlphTree.getCheckedNodes();

      if (_arr.length) {
        this.$emit("update:data", {
          id: _arr[0].id,
          content: _arr[0].content
        });
      } else {
        this.$emit("update:data", {});
      }
      this.filterName = null;
      this.isMlphDialog = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.mlph-layer {
  .el-pagination {
    padding: 10px;
  }
  .el-form {
    padding: 10px;
    /deep/ .el-form-item {
      margin: 0;
    }
    .el-select,
    .el-input {
      width: 120px;
    }
  }
}
</style>