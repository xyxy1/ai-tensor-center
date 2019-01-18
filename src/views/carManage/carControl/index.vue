<template>
  <div class="app-container">
    <!-- 表单筛选 -->
    <el-form class="form" @keyup.enter.native="onSearch">
      <span>关键字</span>
      <el-input size="mini" @keyup.enter.native="onSearch" placeholder="车牌号/业主姓名" v-model="listQuery.condition"></el-input>
      <el-button size="mini" type="primary" @click="onSearch">查询</el-button>
      <el-button size="mini" @click="onResetForm">重置</el-button>
    </el-form>

    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        车辆布控
        <em>{{listTableData.total?listTableData.total:0}}</em>
      </div>
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-delete" @click="onItemDelete">删除</el-button>
      </div>
    </div>

    <!-- 表格模式 S -->
    <el-table ref="listTabel" :data="listTableData.rows" height="calc(100vh - 255px)" v-loading.body="listTableLoading" highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="plateNo" label="车牌号" align="center" />
      <el-table-column prop="name" label="车主姓名" align="center" />
      <el-table-column prop="identityNo" label="证件号码" align="center" />
      <el-table-column prop="mobile" label="联系方式" align="center" />
      <el-table-column fixed="right" min-width="70" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemEdit(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格模式 E -->

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total" />

    <!-- 表单编辑 -->
    <el-dialog :title="form.id?'编辑':'添加'" :visible.sync="isFormDialog" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="车牌号" prop="plateNo">
          <el-input v-model="form.plateNo" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="车主姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入车主姓名" />
        </el-form-item>
        <el-form-item label="证件号码" prop="identityNo">
          <el-input v-model="form.identityNo" placeholder="请输入证件号码" />
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="备注" prop="description" class="m0">
          <el-input type="textarea" resize="none" :autosize="{ minRows: 3 }" v-model="form.description" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">保 存</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  getControlList,
  postControl,
  deleteControl,
  putControl,
  getControl
} from "@/api/carManage/carControl";

export default {
  name: "carControl",
  data: () => ({
    isFormDialog: false,
    form: {
      id: null,
      plateNo: null,
      name: null,
      identityNo: null,
      mobile: null,
      description: null
    },
    rules: {
      plateNo: { required: true, message: "车牌号不能为空" }
    },

    listQuery: {
      condition: "",
      offset: 1,
      limit: 15
    },
    listTableData: {},
    listTableLoading: false,
    listIds: []
  }),
  created() {
    this.getTableList();
  },
  methods: {
    // 获取表格数据
    getTableList() {
      this.listTableLoading = true;

      getControlList(this.listQuery)
        .then(res => {
          if (res.status === 200) {
            this.listTableData = res.data;
          }
        })
        .finally(err => {
          this.listTableLoading = false;
        });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.listQuery.limit = 15;
      this.getTableList();
    },
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
        deleteControl({ ids: this.listIds }).then(res => {
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
    onItemEdit(id) {
      this.form.id = id || null;

      this.isFormDialog = true;
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields();
      });

      if (this.form.id) {
        getControl(this.form.id).then(res => {
          if (res.status === 200) {
            this.form = res.data;
          }
        });
      }
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    // 分页更新
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getTableList();
    },
    // 分页更新
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    },
    // 列表参数重置
    onResetForm() {
      this.listQuery = {
        condition: "",
        offset: 1,
        limit: 15
      };
    },
    /* 以下表单处理 */
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.id) {
            putControl(this.form).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "保存成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.isFormDialog = false;
                this.getTableList();
              }
            });
          } else {
            // 新增
            postControl(this.form).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "新增成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });
              if (isSuccess) {
                this.isFormDialog = false;
                this.getTableList();
              }
            });
          }
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  position: relative;
  height: 100%;
  .m0 {
    margin: 0;
  }
  .form {
    background: #fafbfd;
    height: 46px;
    line-height: 46px;
    overflow: hidden;
    font-size: 0;
    & > * {
      margin-right: 6px;
    }
    span {
      display: inline-block;
      padding: 0 2px 0 10px;
      text-align: right;
      font-size: 13px;
      color: #3f4041;
    }
    .el-date-editor {
      width: 330px;
    }
    .el-select {
      width: 100px;
    }
    .el-input {
      width: 180px;
    }
    .picture-search {
      width: 140px;
    }
    .el-button {
      margin-left: 0;
    }
  }
  .el-pagination {
    padding: 10px;
  }
}
</style>