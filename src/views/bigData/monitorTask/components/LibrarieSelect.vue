<template>
  <div class="librarie-select">
    <div class="librarie-box" @click="isLibrarieDialog = true">
      <div class="tags" v-if="updateData.length">
        <el-tag v-for="(item,index) in updateData" :key="item.num" size="small" disable-transitions closable @close="onClose(index)">
          {{item.label}}
        </el-tag>
      </div>
      <div class="placeholder" v-else>请选择人脸库</div>
    </div>

    <el-dialog title="选择人脸库" class="librarie-layer body0" :visible.sync="isLibrarieDialog" width="560px" append-to-body>
      <el-row>
        <el-col :span="12" class="left-box">
          <el-tree class="filter-menu" show-checkbox :data="librarieData" @check="onTreeChange" node-key="num" :expand-on-click-node="false" ref="tree" default-expand-all>
            <div class="menu-item" slot-scope="{ node, data }">
              <svg-icon icon-class="folder" />
              <span>{{node.label}}</span>
            </div>
          </el-tree>
        </el-col>
        <el-col :span="12" class="right-box">
          <div class="title">已选择了{{librarieArr.length}}个人脸库</div>
          <div class="item" v-for="(item,index) in librarieArr" :key="index">
            <span>{{item.label}}</span>
            <i class="el-icon-error close" @click="onDeleteRow(index)"></i>
          </div>
        </el-col>
      </el-row>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">确定</el-button>
        <el-button size="mini" @click="isLibrarieDialog = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getLabelType } from "@/api/faceModule/faceLabel/index";

export default {
  props: {
    value: {
      type: Array
    }
  },
  data: () => ({
    isLibrarieDialog: false,
    librarieData: [],
    librarieArr: [],
    updateData: []
  }),
  watch: {
    value(val) {
      this.updateData = val;

      this.updateTree();
    },
    updateData(val) {
      this.$emit("input", val);
    },
    isLibrarieDialog(val) {
      if (val) {
        this.updateTree();
      }
    }
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      await getLabelType().then(res => {
        this.librarieData = res.data.rows;
      });
    },
    updateTree() {
      this.$nextTick(() => {
        if (this.$refs.tree) {
          this.$refs.tree.setCheckedKeys(this.updateData.map(item => item.num));
          this.onTreeChange();
        }
      });
    },
    onTreeChange(row) {
      this.librarieArr = this.$refs.tree.getCheckedNodes();
    },
    onClose(index) {
      this.updateData.splice(index, 1);
    },
    onDeleteRow(index) {
      this.librarieArr.splice(index, 1);

      this.$refs.tree.setCheckedKeys(this.librarieArr.map(item => item.num));
    },
    onSubmit() {
      this.updateData = this.librarieArr.map(item => {
        return {
          num: item.num,
          label: item.label
        };
      });
      this.isLibrarieDialog = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.librarie-select {
  width: 100%;
  .librarie-box {
    background-color: #fff;
    background-image: none;
    width: 100%;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    cursor: pointer;
    .placeholder {
      padding: 0 15px;
      height: 36px;
      line-height: 36px;
      color: #c0c4cc;
    }
    .tags {
      padding: 3px 6px 3px 0;
      overflow: hidden;
    }
    .el-tag {
      float: left;
      margin: 3px 0 3px 6px;
    }
  }
}

.librarie-layer {
  .el-row {
    display: flex;
    height: 50vh;
  }
  .el-col {
    height: 100%;
    overflow: auto;
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
