<template>
  <div class="user-configure">
    <!-- 表单筛选 -->
    <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="getTableList">
      <el-form-item label="关键字">
        <el-input v-model="listQuery.keyword" size="mini" placeholder="名称/账户" />
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="getTableList">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        用户管理
        <em>{{listTableData.total?listTableData.total:0}}</em>
      </div>
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemUpdate('')" v-permission="'userMan:btn_add'">添加</el-button>
        <el-button class="txt-btn" size="mini" icon="el-icon-delete" type="text" @click="onItemDelete" v-permission="'userMan:btn_batchDelete'">删除</el-button>
      </div>
    </div>
    <el-table :data="listTableData.rows" v-loading.body="listLoading" height="calc(100vh - 302px)" highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="50" />
      <el-table-column align="center" label="姓名" prop="name" />
      <el-table-column align="center" label="账户" prop="username" />
      <el-table-column align="center" label="性别" width="80px" prop="sex" />
      <el-table-column align="center" label="状态" width="100px" prop="status" />
      <el-table-column align="center" fixed="right" label="操作" width="160">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemUpdate(scope.row)" v-permission="'userMan:btn_edit'">编辑</el-button>
          <el-button size="mini" type="primary" @click="onResetPassword(scope.row.id)" v-permission="'userMan:btn_reset_pwd'">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-size="listQuery.limit" :page-sizes="[15,30,50]" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total" />

    <el-dialog :title="form.id === null?'新增用户':'编辑用户'" :visible.sync="isFormDialog" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="账户" prop="username">
          <el-input v-model="form.username" placeholder="请输入账户"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="form.id === null">
          <el-input type="password" v-model="form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <dict-select dict-name="comm_sex" v-model="form.sex" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5}" placeholder="请输入内容" v-model="form.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="onSubmit">确 定</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  putResetPassword,
  getUserList,
  postUser,
  deleteUser,
  putUser,
  getUser
} from "@/api/userManage";

export default {
  props: {
    departId: {
      type: [String, Number]
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
      sexOptions: [],
      form: {
        id: null,
        username: null,
        name: null,
        sex: null,
        password: null,
        description: null,
        departId: null
      },
      rules: {
        name: { required: true, message: "请输入用户" },
        username: [
          { required: true, message: "请输入账户" },
          {
            required: true,
            pattern: /^[a-zA-Z0-9_]+$/,
            message: "只能是字母数字和下划线"
          },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
        ],
        password: [
          { required: true, message: "请输入密码" },
          { min: 5, max: 20, message: "长度在 5 到 20 个字符" }
        ],
        sex: { required: true, message: "请选择性别" }
      }
    };
  },
  watch: {
    departId(val) {
      val && this.getTableList();
    }
  },
  methods: {
    getTableList() {
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
      getUserList(this.listQuery).then(response => {
        this.listLoading = false;
        this.listTableData = response.data;
      });
    },
    // 关键字搜索框
    onSearchChange(val, img) {
      this.listQuery.keyword = val;
      this.listQuery.image = img;
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
    onItemDelete() {
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
        deleteUser({
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
        this.form.password = null;
        if (row) {
          getUser(row.id).then(res => {
            if (res.status == 200) {
              this.form = res.data;
            }
          });
        } else {
          this.form.id = null;
        }
      });
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return;

        if (this.form.id) {
          this.form.password = null;
          putUser(this.form).then(res => {
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
          postUser(this.form).then(res => {
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
    // 重置密码
    onResetPassword(id) {
      putResetPassword(id).then(res => {
        let isSuccess = res.status === 200;
        if (!isSuccess) {
          // 提示处理
          this.$notify({
            title: "失败",
            message: res.message,
            type: "error",
            duration: 2000
          });
          return;
        }

        this.$alert(`密码已帮您重置为【${res.data}】`, "提示", {
          confirmButtonText: "确定"
        });
      });
    },
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getTableList();
    }
  }
};
</script>
<style lang="scss" scoped>
.user-configure {
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

