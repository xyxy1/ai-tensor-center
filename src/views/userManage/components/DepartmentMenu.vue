<template>
  <el-col :span="6" class="menu-tree">
    <div class="title">
      <b>组织架构</b>
      <el-button size="mini" @click="onAddItem(-1)">新增部门</el-button>
    </div>
    <div class="tree-box">
      <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText" clearable></el-input>
      <el-tree ref="menuTree" class="tree" :data="menuData" :filter-node-method="filterNode" @node-expand="onTreeExpand" @node-collapse="onTreeExpand" :default-expanded-keys="treeExpandedKeys" node-key="id" highlight-current :expand-on-click-node="false">
        <div class="menu-item" slot-scope="{ node, data }" @click="onMenuClick(data)">
          {{ node.label }}
          <el-dropdown @command="onCommand($event, data)" class="more">
            <div class="icon">
              <svg-icon icon-class="more" />
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="add" v-permission="'departMan:btn_add'">添加</el-dropdown-item>
              <el-dropdown-item command="upd" v-permission="'departMan:btn_edit'">编辑</el-dropdown-item>
              <el-dropdown-item command="del" v-permission="'departMan:btn_delete'">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-tree>
    </div>

    <el-dialog :title="form.id?'编辑部门':'新增部门'" class="form-layer" :visible.sync="isFormDialog" width="400px">
      <el-form ref="form" :model="form" :rules="rules" label-width="60px">
        <el-form-item prop="id" class="m0" />
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入编码">
          </el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type" class="m0">
          <dict-select dict-name="org_depart" v-model="form.type" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">保 存</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
      </div>
    </el-dialog>
  </el-col>
</template>
<script>
import {
  getDepartmentTree,
  postDepartment,
  getDepartment,
  deleteDepartment,
  putDepartment
} from "@/api/userManage";

const form = {
  code: null,
  name: null,
  type: null,
  parentId: null
};

export default {
  data() {
    return {
      filterText: null,
      menuData: null,
      treeExpandedKeys: [],

      isFormDialog: false,
      form: form,
      rules: {
        code: { required: true, message: "请输入编码" },
        name: { required: true, message: "请输入部门名称" },
        type: { required: true, message: "请选择部门类型" }
      }
    };
  },
  watch: {
    filterText(val) {
      this.$refs.menuTree.filter(val);
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      getDepartmentTree().then(res => {
        // if (res.status == 200) {
        //   this.menuData = res.data;
        // }
        this.menuData = res;
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    onTreeExpand(data) {
      let _index = this.treeExpandedKeys.indexOf(data.id);
      if (_index < 0) {
        this.treeExpandedKeys.push(data.id);
      } else {
        this.treeExpandedKeys.splice(_index, 1);
      }
    },
    onMenuClick(data) {
      this.$emit("change", data);
    },
    // 更多操作
    onCommand(command, data) {
      if (command == "del") {
        this.$confirm(`确定删除【${data.label}】？`, "提示", {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          confirmButtonClass: "el-button--mini",
          cancelButtonClass: "el-button--mini fr",
          type: "warning"
        }).then(() => {
          deleteDepartment(data.id).then(res => {
            let isSuccess = res.status == 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "删除成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.init();
            }
          });
        });
      }
      if (command == "upd") {
        getDepartment(data.id).then(res => {
          if (res.status == 200) {
            this.openForm(res.data);
          }
        });
      }
      if (command == "add") {
        this.onAddItem(data.id);
      }
    },
    onAddItem(pId) {
      this.openForm(
        Object.assign(form, {
          parentId: pId
        })
      );
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return;
        }

        if (this.form.id) {
          putDepartment(this.form).then(res => {
            let isSuccess = res.status == 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "修改成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.isFormDialog = false;
              this.init();
            }
          });
        } else {
          postDepartment(this.form).then(res => {
            let isSuccess = res.status == 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "添加成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.isFormDialog = false;
              this.init();
            }
          });
        }
      });
    },
    openForm(newForm) {
      this.form = form;
      this.isFormDialog = true;

      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields();
        if (newForm) {
          this.form = newForm;
        }
      });
    }
  }
};
</script>
<style lang="scss">
.menu-tree {
  background: #fafbfd;
  border-right: 1px solid #e1e1e1;
  overflow: auto;
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
  .tree-box {
    height: calc(100% - 46px);
    padding: 0 6px;
    border-top: 1px solid #e1e1e1;
    .el-input {
      margin: 10px 0;
    }
  }
  .tree {
    background: transparent;
    overflow: auto;
    font-size: 13px;
    color: #333;
    .menu-item {
      position: relative;
      flex: 1;
      height: 100%;
      .more {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        .icon {
          display: inline-block;
          height: 100%;
        }
      }
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
