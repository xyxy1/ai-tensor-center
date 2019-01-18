<template>
  <el-dialog title="摄像头授权" :visible.sync="isCameraDialog" class="position-camera" width="500px">
    <el-input placeholder="输入关键字进行过滤" v-model="filterText" />
    <el-tree class="filter-tree" node-key="id" check-strictly :data="treeData" show-checkbox :expand-on-click-node="false" highlight-current ref="cameraTree" default-expand-all>
      <div class="tree-item" slot-scope="{ node, data }">{{data.disabled?data.label:data.cameraName}}</div>
    </el-tree>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="onSubmit">保存</el-button>
      <el-button size="mini" @click="isCameraDialog = false">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  getCameraTree,
  getPositionCamera,
  postPositionCamera
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
      treeData: [],
      isCameraDialog: false
    };
  },
  watch: {
    isOpen(val) {
      this.isCameraDialog = val;
      this.$refs.cameraTree && this.$refs.cameraTree.setCheckedKeys([]);
    },
    isCameraDialog(val) {
      this.$emit("update:isOpen", val);

      if (val) {
        this.init();
      }
    },
    filterText(val) {
      this.$refs.cameraTree.filter(val);
    }
  },
  methods: {
    init() {
      getCameraTree().then(res => {
        if (res.status == 200) {
          this.treeData = this.treeDataConvert(res.data);
          this.initDeparts();
        }
      });
    },
    initDeparts() {
      getPositionCamera(this.positionId).then(res => {
        if (res.status == 200) {
          this.$refs.cameraTree.setCheckedKeys(res.data);
        }
      });
    },
    treeDataConvert(data) {
      let _treeData = [];
      data.map(item => {
        _treeData.push({
          id: "root" + item.id,
          label: item.serial,
          disabled: true,
          children: item.cameras
        });
      });
      return _treeData;
    },
    getTreeNodeKey(node) {
      return node.id;
    },
    onSubmit() {
      postPositionCamera(this.positionId, {
        cameras: this.$refs.cameraTree.getCheckedKeys().join()
      }).then(res => {
        let isSuccess = res.status === 200;
        // 提示处理
        this.$notify({
          title: isSuccess ? "成功" : "失败",
          message: isSuccess ? "摄像头授权成功" : res.message,
          type: isSuccess ? "success" : "error",
          duration: 2000
        });

        if (isSuccess) {
          this.$refs.cameraTree.setCheckedKeys([]);
          this.isCameraDialog = false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.position-camera {
  .filter-tree {
    margin-top: 10px;
  }
}
</style>
