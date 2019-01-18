<template>
  <div class="menu-mian">
    <el-row class="main">
      <el-col :span="5" class="aside">
        <div class="asideL">
          <el-input placeholder="输入关键字进行过滤" v-model="filterText" prefix-icon="el-icon-search" size="mini" clearable>
            <el-button size="mini" slot="append" @click="onCreateMenu(-1)">
              <i class="el-icon-plus" />
            </el-button>
          </el-input>
        </div>
        <el-tree class="filter-tree" :data="treeData" node-key="id" highlight-current :props="defaultProps" :expand-on-click-node="false" :filter-node-method="filterNode" ref="menuTree" @node-click="getNodeData">
          <div class="menu-item" slot-scope="{ node, data }">
            {{ node.label }}
            <el-dropdown @command="onCommand($event, data)" class="more">
              <div class="icon">
                <svg-icon icon-class="more" />
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="add" v-permission="'menuMan:btn_menu_add'">添加</el-dropdown-item>
                <el-dropdown-item command="upd" v-permission="'menuMan:btn_menu_edit'">编辑</el-dropdown-item>
                <el-dropdown-item command="del" v-permission="'menuMan:btn_menu_delete'">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-tree>
      </el-col>
      <el-col :span="19" class="contentBox">
        <menu-content :menuId='currentId' ref="menuContent" />
      </el-col>
    </el-row>

    <el-dialog :title="form.id?'编辑部门':'新增部门'" :visible.sync="isFormDialog" width="500px">
      <el-form label-width="80px" :model="form" ref="form">
        <el-form-item label="路径编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入路径编码" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="父级节点" prop="parentId">
          <el-input v-model="form.parentId" placeholder="请输入父级节点" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标" />
        </el-form-item>
        <el-form-item label="资源路径" prop="href">
          <el-input v-model="form.href" placeholder="请输入资源路径" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <dict-select dict-name="authority_menu" v-model="form.type" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="别名" prop="alias">
          <el-input v-model="form.alias" placeholder="请输入别名" />
        </el-form-item>
        <el-form-item label="前端组件" prop="attr1">
          <el-input v-model="form.attr1" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSubmint()">保存</el-button>
        <el-button @click="isFormDialog=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getMenu,
  postMenu,
  putMenu,
  deleteMenu,
  getMenuTree
} from "@/api/basicConfig/menu/index";

export default {
  name: "base-menuManager",
  components: {
    "menu-content": () => import("./components/menuContent")
  },
  data() {
    return {
      treeData: [],
      filterText: "",
      listQuery: {
        name: undefined
      },
      defaultProps: {
        children: "children",
        label: "title"
      },
      isFormDialog: false,
      form: {
        code: undefined,
        title: undefined,
        parentId: undefined,
        href: undefined,
        icon: undefined,
        orderNum: undefined,
        description: undefined,
        path: undefined,
        enabled: undefined,
        type: undefined,
        attr1: undefined
      },
      currentId: -1
    };
  },
  watch: {
    filterText(val) {
      this.$refs.menuTree.filter(val);
    }
  },

  methods: {
    init() {
      this.getList();
    },
    getList() {
      getMenuTree(this.listQuery).then(data => {
        this.treeData = data;
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    getNodeData(data) {
      this.$refs.menuContent.menuId = data.id;
      this.$refs.menuContent.getList();
    },

    onCommand(command, data) {
      if (command == "del") {
        this.$confirm(`确定删除【${data.label}】？`, "提示", {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          confirmButtonClass: "el-button--mini",
          cancelButtonClass: "el-button--mini fr",
          type: "warning"
        }).then(() => {
          deleteMenu(data.id).then(res => {
            let isSuccess = res.status == 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "删除成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.getList();
            }
          });
        });
      }
      if (command == "upd") {
        getMenu(data.id).then(res => {
          if (res.status == 200) {
            this.openForm(res.data);
          }
        });
      }
      if (command == "add") {
        this.onCreateMenu(data.id);
      }
    },
    onSubmint() {
      if (this.form.id) {
        putMenu(this.form.id, this.form).then(res => {
          let isSuccess = res.status == 200;
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "修改成功" : "修改失败",
            type: isSuccess ? "success" : "error",
            duration: 2000
          });

          if (isSuccess) {
            this.getList();
            this.isFormDialog = false;
          }
          this.resetForm();
        });
      } else {
        postMenu(this.form).then(res => {
          let isSuccess = res.status == 200;
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "新增成功" : "新增失败",
            type: isSuccess ? "success" : "error",
            duration: 2000
          });

          if (isSuccess) {
            this.getList();
            this.isFormDialog = false;
            this.resetForm();
          }
        });
      }
    },
    onCreateMenu(pid) {
      this.resetForm();
      this.openForm(
        Object.assign(this.form, {
          parentId: pid
        })
      );
    },
    openForm(newForm) {
      this.resetForm();
      this.isFormDialog = true;
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields();
        if (newForm) {
          this.form = newForm;
        }
      });
    },
    resetForm() {
      this.form = {
        code: undefined,
        title: undefined,
        parentId: this.currentId,
        href: undefined,
        icon: undefined,
        orderNum: undefined,
        description: undefined,
        path: undefined,
        enabled: undefined
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.menu-mian {
  height: 100% !important;
  & > .el-col {
    height: 100%;
  }
  .contentBox {
    padding-left: 0px !important;
    padding-right: 0px !important;
  }
}
.main {
  height: 100%;
  .aside {
    background-color: #fafbfb;
    padding: 0px !important;
    height: 100%;
    border-right: #e1e1e1 solid 1px;
    .asideL {
      padding: 0px 5px;
      font-size: 16px;
      height: 46px;
      line-height: 46px;
    }
  }
  .filter-tree {
    height: calc(100% - 46px);
    overflow-y: scroll;
    overflow-x: hidden;
    background-color: #fafbfb;
    padding-left: 5px;
    font-size: 13px;
    color: #333;
    border-top: #e1e1e1 1px solid;
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
  }
}
</style>


