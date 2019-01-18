<template>
  <el-col :span="6" class="menu-tree">
    <div class="title">
      <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText" clearable />
    </div>
    <el-tree ref="menuTree" class="menu" :data="menuData" :filter-node-method="filterNode" @node-expand="onTreeExpand" @node-collapse="onTreeExpand" :default-expanded-keys="treeExpandedKeys" node-key="code" highlight-current :expand-on-click-node="false">
      <div class="menu-item" :class="{sel:currentRow.code == data.code, children:!data.children}" slot-scope="{ node, data }" @click="onMenuClick(data)">
        <el-dropdown @command="onCommand($event, data)" class="more" placement="bottom-start">
          <div class="icon">
            <svg-icon icon-class="more" />
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="add" v-if="data.type == 'townStreet'">添加居/村委会</el-dropdown-item>
            <el-dropdown-item command="upd">编辑</el-dropdown-item>
            <el-dropdown-item command="del">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <svg-icon icon-class="locale" />
        <span>{{ data.label }}</span>
        <div class="total">{{data.communityCount}}</div>
      </div>
    </el-tree>
    <div class="add-btn">
      <el-button size="mini" type="primary" plain @click="onAddStreet">新增街道</el-button>
    </div>

    <el-dialog :title="formStreet.id?'编辑街道':'添加街道'" class="form-layer" :visible.sync="isFormStreetDialog" width="500px">
      <el-form :model="formStreet" :rules="rulesStreet" ref="formStreet" label-width="100px">
        <el-form-item prop="id" class="m0" />
        <template v-if="formStreet.id">
          <el-form-item label="所属区域" prop="xzqName">
            <el-input v-model="formStreet.xzqName" readonly />
          </el-form-item>
          <el-form-item prop="xzqCode" class="m0" />
        </template>
        <template v-else>
          <el-form-item prop="xzqName" class="m0" />
          <el-form-item label="所属区域" prop="xzqCode">
            <el-cascader placeholder="请选择所属区域" :options="areaData" :props="cascaderProps" @change="onCascaderChange" :show-all-levels="false" clearable filterable v-if="isFormStreetDialog" />
          </el-form-item>
        </template>
        <el-form-item label="编码" prop="code">
          <el-input v-model="formStreet.code" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="formStreet.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="别名" prop="alias">
          <el-input v-model="formStreet.alias" placeholder="请输入别名" />
        </el-form-item>
        <el-form-item label="类型" prop="type" class="m0">
          <el-select v-model="formStreet.type" placeholder="请选择类型">
            <el-option label="乡" value="1" />
            <el-option label="镇" value="2" />
            <el-option label="街道" value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onStreetSubmit()">确定</el-button>
        <el-button size="mini" @click="isFormStreetDialog = false">取消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="formCommittee.id?'编辑居委会':'添加居委会'" class="form-layer" :visible.sync="isFormCommitteeDialog" width="500px">
      <el-form :model="formCommittee" :rules="rulesCommittee" ref="formCommittee" label-width="100px">
        <el-form-item prop="id" class="m0" />
        <el-form-item label="所属街道" prop="xzjdName">
          <el-input v-model="formCommittee.xzjdName" readonly />
        </el-form-item>
        <el-form-item prop="xzjdCode" class="m0" />
        <el-form-item label="编码" prop="code">
          <el-input v-model="formCommittee.code" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="formCommittee.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="城乡分类" prop="grade">
          <el-select v-model="formCommittee.grade" placeholder="请选择">
            <el-option label="城镇" value="100">
            </el-option>
            <el-option label="城区" value="110">
            </el-option>
            <el-option label="主城区" value="111">
            </el-option>
            <el-option label="城乡结合" value="112">
            </el-option>
            <el-option label="镇区" value="120">
            </el-option>
            <el-option label="镇中心区" value="121">
            </el-option>
            <el-option label="镇乡结合区" value="122">
            </el-option>
            <el-option label="特殊区域" value="123">
            </el-option>
            <el-option label="乡村" value="200">
            </el-option>
            <el-option label="乡中心区" value="210">
            </el-option>
            <el-option label="村庄" value="220">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formCommittee.type">
            <el-option label="社区" value="1">
            </el-option>
            <el-option label="居委会" value="2">
            </el-option>
            <el-option label="村委会" value="3">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onCommitteeSubmit()">确定</el-button>
        <el-button size="mini" @click="isFormCommitteeDialog = false">取消</el-button>
      </div>
    </el-dialog>
  </el-col>
</template>
<script>
import {
  getMenuTree,
  postStreet,
  deleteStreet,
  putStreet,
  getStreet,
  postCommittee,
  deleteCommittee,
  putCommittee,
  getCommittee
} from "@/api/bigData/responsibilityArea";

export default {
  props: {
    data: Array,
    areaData: Array
  },
  data: () => ({
    treeQuery: {
      townCode: null,
      cityCode: null,
      provinceCode: null
    },

    cascaderProps: {
      value: "code"
    },

    // 街道相关
    isFormStreetDialog: false,
    formStreet: {
      id: null,
      xzqName: null,
      xzqCode: null,
      code: null,
      name: null,
      alias: null,
      type: null
    },
    rulesStreet: {
      code: [
        { required: true, message: "请输入编码" },
        { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
      ],
      name: [
        { required: true, message: "请输入名称" },
        { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
      ],
      type: [{ required: true, message: "请输入类型 " }],
      xzqCode: [{ required: true, message: "请输入所属区域 " }]
    },

    // 居委会相关
    isFormCommitteeDialog: false,
    formCommittee: {
      id: null,
      xzjdName: null,
      xzjdCode: null,
      code: null,
      name: null,
      grade: null,
      type: null
    },
    rulesCommittee: {
      code: [
        { required: true, message: "请输入编码" },
        { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
      ],
      name: [
        { required: true, message: "请输入名称" },
        { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
      ],
      type: [{ required: true, message: "请选择类型 " }],
      grade: [{ required: true, message: "请选择城乡分类 " }]
    },

    filterText: "",
    treeExpandedKeys: [],
    menuData: null,
    currentRow: null,
    currentIndex: 0
  }),
  watch: {
    data(val) {
      this.treeQuery.provinceCode = val[0];
      this.treeQuery.cityCode = val[1];
      this.treeQuery.townCode = val[2];
      this.menuList();
    },
    filterText(val) {
      this.$refs.menuTree.filter(val);
    }
  },
  created() {
    this.menuList();
  },
  methods: {
    menuList() {
      getMenuTree(this.treeQuery).then(res => {
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
    },
    onTreeExpand(data) {
      let _index = this.treeExpandedKeys.indexOf(data.code);
      if (_index < 0) {
        this.treeExpandedKeys.push(data.code);
      } else {
        this.treeExpandedKeys.splice(_index, 1);
      }
    },
    // 更多操作
    onCommand(command, data) {
      if (command == "add") {
        this.isFormCommitteeDialog = true;
        this.$nextTick(() => {
          this.$refs.formCommittee && this.$refs.formCommittee.resetFields();
          this.formCommittee = Object.assign(this.formCommittee, {
            xzjdName: data.label,
            xzjdCode: data.code
          });
        });
      }
      if (command == "del") {
        this.$confirm(`确定删除【${data.label}】？`, "提示", {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          confirmButtonClass: "el-button--mini",
          cancelButtonClass: "el-button--mini fr",
          type: "warning"
        }).then(() => {
          // 删除街道
          if (data.type == "townStreet") {
            deleteStreet(data.id).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "删除成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.menuList();
              }
            });
          }
          // 删除居委会
          if (data.type == "neighborhood") {
            deleteCommittee(data.id).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "删除成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.menuList();
              }
            });
          }
        });
      }
      if (command == "upd") {
        // 编辑街道
        if (data.type == "townStreet") {
          getStreet(data.id).then(res => {
            if (res.status == 200) {
              this.isFormStreetDialog = true;
              this.$nextTick(() => {
                this.$refs.formStreet && this.$refs.formStreet.resetFields();
                this.formStreet = res.data;
              });
            }
          });
        }
        // 编辑居委会
        if (data.type == "neighborhood") {
          getCommittee(data.id).then(res => {
            if (res.status == 200) {
              this.isFormCommitteeDialog = true;
              this.$nextTick(() => {
                this.$refs.formCommittee &&
                  this.$refs.formCommittee.resetFields();
                this.formCommittee = res.data;
              });
            }
          });
        }
      }
    },

    /* 街道相关 */
    onAddStreet() {
      this.isFormStreetDialog = true;
      this.$nextTick(() => {
        this.$refs.formStreet && this.$refs.formStreet.resetFields();
      });
    },
    onStreetSubmit() {
      this.$refs.formStreet.validate(async valid => {
        if (valid) {
          if (this.formStreet.id) {
            putStreet(this.formStreet).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "保存成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.isFormStreetDialog = false;
                this.menuList();
              }
            });
          } else {
            postStreet(this.formStreet).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "保存成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.isFormStreetDialog = false;
                this.menuList();
              }
            });
          }
        }
      });
    },
    onCascaderChange(val) {
      this.formStreet.xzqCode = val[2];
    },
    /* 街道相关 */

    /* 居委会相关 */
    onCommitteeSubmit() {
      this.$refs.formCommittee.validate(async valid => {
        if (valid) {
          if (this.formCommittee.id) {
            putCommittee(this.formCommittee).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "保存成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.isFormCommitteeDialog = false;
                this.menuList();
              }
            });
          } else {
            postCommittee(this.formCommittee).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "保存成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.isFormCommitteeDialog = false;
                this.menuList();
              }
            });
          }
        }
      });
    }
    /* 居委会相关 */
  }
};
</script>
<style lang="scss" scoped>
.menu-tree {
  position: relative;
  background: #fafbfd;
  border-right: 1px solid #e1e1e1;
  .m0 {
    margin: 0;
  }
  .title {
    height: 46px;
    line-height: 46px;
    padding: 0 10px;
    font-size: 14px;
    color: #333;
  }
  .add-btn {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 46px;
    line-height: 46px;
    padding: 0 10px;
    border-top: 1px solid #e1e1e1;
    .el-button {
      width: 100%;
    }
  }
  .menu {
    background: transparent;
    height: calc(100% - 92px);
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
      .total {
        margin: 0 6px;
        color: #878c8f;
      }
      .svg-icon {
        display: inline-block;
        height: 100%;
        margin-right: 6px;
        vertical-align: top;
        font-size: 16px;
        color: #b5c0cd;
      }
      .more {
        height: 100%;
        .icon {
          display: inline-block;
          height: 100%;
        }
        .svg-icon {
          margin-right: 2px !important;
        }
      }
      .el-dropdown-item {
        text-align: center;
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

  .form-layer {
    .el-cascader {
      width: 100%;
    }
  }
}

/deep/ .el-dropdown-menu__item {
  text-align: center;
}
</style>