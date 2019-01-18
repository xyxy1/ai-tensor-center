<template>
  <div class="app-manage">
    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-delete" @click="onItemDelete">删除</el-button>
      </div>
    </div>

    <el-table class="table" :data="listData.rows" height="calc(100vh - 256px)" v-loading.body="listLoading" highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="50" />
      <el-table-column label="名称" prop="appName" min-width="100" />
      <el-table-column label="KEY" prop="appKey" min-width="120" />
      <el-table-column label="频率(秒)" prop="appFrequency" width="80" align="center" />
      <el-table-column label="引用次数" prop="quoteCount" width="100" align="center" />
      <el-table-column label="地址" prop="appUrl" min-width="160" />
      <el-table-column label="创建人/创建时间" width="180">
        <template slot-scope="scope">
          <div class="group">
            <label>{{scope.row.crtName}}</label>
            <p>{{scope.row.crtTime}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="修改人/修改时间" width="180">
        <template slot-scope="scope">
          <div class="group">
            <label>{{scope.row.udpName}}</label>
            <p>{{scope.row.updTime}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" min-width="150" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="onTest(scope.row)">推送测试</el-button>
          <el-button size="mini" type="success" @click="onItemEdit(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" :total="listData.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>

    <!-- 表单编辑 -->
    <el-dialog :title="form.id?'编辑':'添加'" :visible.sync="isFormDialog" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="80px">
        <el-form-item label="名称" prop="appName">
          <el-input v-model="form.appName" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="KEY" prop="appKey">
          <el-input v-model="form.appKey" placeholder="请输入代码"></el-input>
        </el-form-item>
        <el-form-item label="URL地址" prop="appUrl">
          <el-input v-model="form.appUrl" placeholder="请输入url地址"></el-input>
        </el-form-item>
        <el-form-item label="EID" prop="appEid">
          <el-input v-model="form.appEid" placeholder="请输入EID"></el-input>
        </el-form-item>
        <el-form-item label="社区id" prop="appCommunityId">
          <el-input v-model="form.appCommunityId" placeholder="请输入社区id"></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="appDeviceName">
          <el-input v-model="form.appDeviceName" placeholder="请输入设备名称"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="appTo">
          <el-input v-model="form.appTo" placeholder="请输入手机号码,多个用逗号隔开"></el-input>
        </el-form-item>
        <el-form-item label="频率(秒)" prop="appFrequency">
          <el-input v-model="form.appFrequency" placeholder="请输入调用频率"></el-input>
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
  page,
  addObj,
  getObj,
  delObj,
  putObj,
  getTest
} from "@/api/Linkage/appLinkage/index";

export default {
  data: () => ({
    isFormDialog: false, // 控制表单显示
    form: {
      id: null,
      appName: null,
      appKey: null,
      appEid: null,
      appCommunityId: null,
      appDeviceName: null,
      appTo: null,
      appFrequency: null,
      appUrl: null
    },
    rules: {
      appName: { required: true, message: "名称不能为空" },
      appKey: { required: true, message: "KEY不能为空" },
      appUrl: { required: true, message: "URL地址不能为空" }
    },

    listIds: [],
    listData: {},
    listQuery: {
      offset: 1,
      limit: 15
    },
    listLoading: false
  }),
  methods: {
    init() {
      this.getTableList();
    },
    // 获取表格数据
    getTableList() {
      this.listLoading = true;
      page(this.listQuery)
        .then(res => {
          this.listData = res.data;
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.id) {
            putObj(this.form.id, this.form).then(res => {
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
            addObj(this.form).then(res => {
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
    },
    // 表单编辑
    onItemEdit(id) {
      this.form.id = id || null;

      if (this.form.id) {
        getObj(this.form.id).then(res => {
          if (res.status === 200) {
            this.isFormDialog = true;
            this.$nextTick(() => {
              this.$refs.form && this.$refs.form.resetFields();
              this.form = res.data;
            });
          }
        });
      } else {
        this.isFormDialog = true;
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.resetFields();
        });
      }
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
        delObj({
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
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    onTest(row) {
      getTest(row.id).then(res => {
        let isSuccess = res.status === 200;
        this.$message({
          type: isSuccess ? "success" : "error",
          message: isSuccess ? res.data : res.message
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
.app-manage {
  .m0 {
    margin: 0;
  }
  .common-tool {
    border-top: 0;
  }
  .el-select {
    width: 100%;
  }
  .table {
    .group {
      label {
        display: inline-block;
        vertical-align: top;
        line-height: 120%;
      }
      p {
        line-height: 120%;
      }
    }
    .el-button {
      margin: 0;
    }
  }
  .el-pagination {
    padding: 10px;
  }
}
</style>
