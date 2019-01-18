<template>
  <div class="sms-manage">
    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-delete" @click="onItemDelete">删除</el-button>
      </div>
    </div>

    <el-table class="table" :data="listData.rows" height="calc(100vh - 256px)" v-loading.body="listLoading" highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="50" />
      <el-table-column label="名称" prop="smsName" min-width="100" />
      <el-table-column label="模板代码" prop="smsTemplateCode" min-width="100" />
      <el-table-column label="频率(秒)" prop="smsFrequency" width="80" align="center" />
      <el-table-column label="引用次数" prop="quoteCount" width="100" align="center" />
      <el-table-column label="地址" prop="smsUrl" min-width="160" />
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
        <el-form-item label="名称" prop="smsName">
          <el-input v-model="form.smsName" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="AppId" prop="smsAppId">
          <el-input v-model="form.smsAppId" placeholder="请输入AppId"></el-input>
        </el-form-item>
        <el-form-item label="AppPwd" prop="smsAppPasswd">
          <el-input v-model="form.smsAppPasswd" placeholder="请输入AppPwd"></el-input>
        </el-form-item>
        <el-form-item label="频率(S)" prop="smsFrequency">
          <el-input v-model="form.smsFrequency" placeholder="请输入调用频率"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="smsUrl">
          <el-input v-model="form.smsUrl" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="模板代码" prop="smsTemplateCode">
          <el-input v-model="form.smsTemplateCode" placeholder="请输入模板代码"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="smsPhones">
          <el-input v-model="form.smsPhones" placeholder="请输入手机号码,多个用逗号隔开"></el-input>
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
} from "@/api/Linkage/msgLinkage/index";

export default {
  data: () => ({
    isFormDialog: false, // 控制表单显示
    form: {
      id: null,
      smsName: null,
      smsUrl: null,
      smsTemplateCode: null,
      smsAppId: null,
      smsAppPasswd: null,
      smsPhones: null,
      smsFrequency: null
    },
    rules: {
      smsName: { required: true, message: "名称不能为空" },
      smsAppId: { required: true, message: "AppId不能为空" },
      smsAppPasswd: { required: true, message: "AppPwd不能为空" },
      smsFrequency: { required: true, message: "调用频率不能为空" }
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
.sms-manage {
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
