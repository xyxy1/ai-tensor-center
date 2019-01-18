<template>
  <el-dialog title="门禁权限" class="accesses-layer body0" :visible.sync="isAccessesDialog" width="800px">
    <el-row>
      <el-col :span="12" class="left-box">
        <el-tree class="filter-menu" show-checkbox :data="menuData" @check="onMenuChange" node-key="id" :expand-on-click-node="false" ref="menuTree" default-expand-all>
          <div class="menu-item" slot-scope="{ node, data }">
            <svg-icon icon-class="folder" v-if="data.nodeType == '0'" />
            <svg-icon icon-class="cameraManage" v-if="data.nodeType == '1'" />
            <span>{{node.label}}</span>
          </div>
        </el-tree>
      </el-col>
      <el-col :span="12" class="right-box">
        <div class="title">已选择了{{cameras.length}}个门禁</div>
        <div class="item" v-for="(item,index) in cameras" :key="index">
          <span>{{item.accessName}}</span>
          <i class="el-icon-error close" @click="onDeleteRow(index)"></i>
        </div>
      </el-col>
    </el-row>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="onSubmit">确定</el-button>
      <el-button size="mini" @click="isAccessesDialog = false">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getAreaCameras } from "@/api/faceModule/faceLabel/index";

export default {
  props: {
    data: Array,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data: () => ({
    isAccessesDialog: false,
    menuData: [],
    cameras: []
  }),
  watch: {
    data(val) {
      if (val.length) {
        this.cameras = val;
      }
    },
    isOpen(val) {
      this.isAccessesDialog = val;
    },
    isAccessesDialog(val) {
      this.$emit("update:isOpen", val);
      if (!val) {
        this.menuData = [];
        this.cameras = [];
      } else {
        this.getMenuList(() => {
          this.$refs.menuTree.setCheckedNodes(this.cameras);
        });
      }
    }
  },
  methods: {
    getMenuList(fn) {
      getAreaCameras().then(res => {
        if (res.status == 200) {
          this.menuData = res.data;
          this.$nextTick(() => {
            fn && fn();
          });
        }
      });
    },
    onMenuChange() {
      let _arr = this.$refs.menuTree
        .getCheckedNodes()
        .filter(item => item.nodeType == "1")
        .map(item => {
          return {
            id: item.id,
            accessName: item.label
          };
        });

      this.cameras = _arr;
    },
    onDeleteRow(index) {
      this.cameras.splice(index, 1);

      this.$refs.menuTree.setCheckedNodes(this.cameras);
    },
    onSubmit() {
      this.$emit("update:data", this.cameras);
      this.isAccessesDialog = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.accesses-layer {
  .el-row {
    display: flex;
    min-height: 60vh;
  }
  .left-box {
    border-right: 1px solid #e5e5e5;
  }
  .right-box {
    padding: 20px;
    font-size: 13px;
    .title {
      margin-bottom: 10px;
      color: #999;
    }
    .item {
      line-height: 30px;
      color: #333;
    }
    .close {
      float: right;
      margin-top: 6px;
      font-size: 18px;
      color: #cfd0d3;
    }
  }
  .filter-menu {
    padding: 10px 10px 10px 0;
  }
  .menu-item {
    display: inline-block;
    height: 100%;
    line-height: 36px;
    vertical-align: top;
    font-size: 13px;
    color: #333;
    .svg-icon {
      display: inline-block;
      height: 100%;
      margin-right: 4px;
      vertical-align: top;
      font-size: 20px;
      color: #0fa0ff;
    }
  }
}
</style>
