<template>
  <div class="role-configure">
    <!-- 表单筛选 -->
    <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="getTableList">
      <el-form-item label="关键字">
        <el-input v-model="listQuery.keyword" size="mini" placeholder="名称/编码" />
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="getTableList">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" v-permission="'groupMan:btn_authority'" @click="onAuthorityDialog" type="success" icon="edit">权限分配</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" v-permission="'groupMan:btn_authorise'" @click="onAuthorizeDialog" type="success" icon="edit">权限下发</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" v-permission="'groupMan:btn_copy'" @click="onCopyDialog" type="success" icon="edit">角色复制</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        角色管理
        <em>{{listTableData.total?listTableData.total:0}}</em>
      </div>
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemUpdate('')" v-permission="'groupMan:btn_add'">添加</el-button>
        <el-button class="txt-btn" size="mini" icon="el-icon-delete" type="text" @click="onDelete" v-permission="'groupMan:btn_batchDelete'">删除</el-button>
      </div>
    </div>

    <el-table :data="listTableData.rows" v-loading.body="listLoading" height="calc(100vh - 302px)" highlight-current-row @current-change="onTableChange" @selection-change="onListChange">
      <el-table-column type="selection" width="50" />
      <el-table-column align="center" label="角色名称" prop="groupName" />
      <el-table-column align="center" label="类型" prop="groupType" />
      <el-table-column fixed="right" label="操作" width="160px" v-permission="'groupMan:btn_edit' || 'groupMan:btn_delete'">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemUpdate(scope.row)" v-permission="'groupMan:btn_edit'">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-size="listQuery.limit" :page-sizes="[15,30,50]" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total" />

    <!-- 角色编辑 -->
    <el-dialog :title="form.id === null?'新增角色':'编辑角色'" :visible.sync="isFormDialog" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入编码"></el-input>
        </el-form-item>
        <el-form-item v-if="form.id === null" label="类型" prop="groupType">
          <dict-select dict-name="group_type" v-model="form.groupType" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5}" placeholder="请输入内容" v-model="form.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="onFormSubmit('form', form.id === null?'add':'upd')">确 定</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 权限分配 -->
    <role-authority :groupId="currentId" :is-open.sync="isAuthorityDialog" />
    <!-- 权限下发 -->
    <role-authorize :groupId="currentId" :is-open.sync="isAuthorizeDialog" />
    <!-- 角色复制 -->
    <role-copy :groupId="currentId" :departId="departId" :is-open.sync="isCopyDialog" />
  </div>
</template>
<script>
import {
  getRoleList,
  postRole,
  deleteRole,
  putRole,
  getRole
} from "@/api/userManage";

export default {
  components: {
    "role-copy": () => import("./RoleCopy"),
    "role-authority": () => import("./RoleAuthority"),
    "role-authorize": () => import("./RoleAuthorize")
  },
  props: {
    departId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      listLoading: false,
      listIds: [],
      listQuery: {
        keyword: null,
        departId: null,
        offset: 1,
        limit: 15
      },
      listTableData: {},

      isFormDialog: false,
      typeOptions: [],
      form: {
        id: null,
        code: null,
        groupName: null,
        groupType: null,
        description: null,
        departId: null
      },
      rules: {
        groupName: { required: true, message: "请输入名称" },
        code: [
          { required: true, message: "请输入编码" },
          {
            required: true,
            pattern: /^[a-zA-Z0-9_]+$/,
            message: "只能是字母数字和下划线"
          }
        ],
        groupType: { required: true, message: "请选择部门" }
      },

      isCopyDialog: false,
      isAuthorityDialog: false,
      isAuthorizeDialog: false,
      currentId: null
    };
  },
  watch: {
    departId(val) {
      val && this.getTableList();
    }
  },
  created() {},
  methods: {
    getTableList() {
      this.currentId = null;
      if (!this.departId) {
        this.$notify({
          title: "提示",
          message: "请先选择部门节点！",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.listQuery.departId = this.departId;
      this.listLoading = true;
      getRoleList(this.listQuery).then(response => {
        this.listLoading = false;
        this.listTableData = response.data;
      });
    },
    // 重置按钮
    onResetForm() {
      this.listQuery = {
        keyword: null,
        departId: null,
        offset: 1,
        limit: 15
      };
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    // 批量删除
    onDelete() {
      if (!this.listIds.length) {
        this.$notify({
          title: "提示",
          message: "请选择需要删除的数据",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.$confirm("此操作将永久删除, 是否继续?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonClass: "el-button--mini",
        cancelButtonClass: "el-button--mini fr",
        type: "warning"
      }).then(() => {
        deleteRole({
          ids: this.listIds
        }).then(res => {
          let isSuccess = res.status === 200;
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "删除成功" : res.message,
            type: isSuccess ? "success" : "error",
            duration: 2000
          });

          if (isSuccess) {
            this.getTableList();
          }
        });
      });
    },
    onItemUpdate(row) {
      if (!this.departId) {
        this.$notify({
          title: "提示",
          message: "请先选择部门节点！",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.isFormDialog = true;
      this.$nextTick(() => {
        this.$refs.form.resetFields();
        this.form.groupType = null;
        if (row) {
          this.form.id = row.id;
          getRole(row.id).then(res => {
            this.form = res.data;
          });
        } else {
          this.form.id = null;
        }
      });
    },
    onFormSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return;

        if (this.form.id) {
          putRole(this.form).then(res => {
            let isSuccess = res.status === 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "修改成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.getTableList();
              this.isFormDialog = false;
            }
          });
        } else {
          this.form.departId = this.departId;
          postRole(this.form).then(res => {
            let isSuccess = res.status === 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "添加成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.getTableList();
              this.isFormDialog = false;
            }
          });
        }
      });
    },
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getTableList();
    },
    onTableChange(row) {
      if (row) {
        this.currentId = row.id;
      }
    },
    // 权限分配模块
    onAuthorityDialog() {
      if (this.currentId === null) {
        this.$notify({
          title: "提示",
          message: "请先选择角色！",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.isAuthorityDialog = true;
    },
    // 权限下发模块
    onAuthorizeDialog() {
      if (this.currentId === null) {
        this.$notify({
          title: "提示",
          message: "请先选择角色！",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.isAuthorizeDialog = true;
    },
    // 权限下发模块
    onCopyDialog() {
      this.isCopyDialog = true;
    }
  }
};
</script>
<style lang="scss" scoped>
.role-configure {
  .form {
    background: #fafbfd;
    height: 46px;
    line-height: 46px;
    padding: 0 12px;
    span {
      display: inline-block;
      margin-right: 8px;
      vertical-align: top;
      font-size: 13px;
      color: #3f4041;
    }
    .el-form-item {
      height: auto;
      line-height: 100%;
      margin: 4px 0 0;
      font-size: 0;
    }
  }
  .el-pagination {
    padding: 10px;
  }
}
</style>