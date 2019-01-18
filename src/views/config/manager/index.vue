<template>
  <div>
    <div class="filter-container">
      <el-form :inline="true" ref="listForm" :model="listQuery" class="form">
        <el-form-item prop="keyword" label="关键字">
          <el-input size="mini" style="width: 200px;" placeholder="配置名称/值" v-model="listQuery.keyword" />
        </el-form-item>
        <el-form-item>
          <el-button size="mini" type="primary" @click="onSearch">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" @click="onResetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        人脸参数配置
        <em>{{listData.total?listData.total:0}}</em>
      </div>
      <div class="right">
        <el-button class="txt-btn" size="mini" @click="onItemAdd" type="text" icon="el-icon-plus">添加</el-button>
        <!--（后续）
           <el-button class="txt-btn" style="margin-left:0px" size="mini" icon="el-icon-delete" type="text" @click="onBatchClear">清除缓存</el-button> -->
      </div>
    </div>
    <el-table :data="listData.rows" height="calc(100vh - 302px)" v-loading.body="listLoading" @selection-change="onListChange">
      <!-- <el-table-column type="selection" width="45" /> -->
      <el-table-column align="center" prop="configName" label="名称" />
      <el-table-column align="center" prop="configValue" label="值" />
      <el-table-column prop="configDesc" label="描述" />
      <el-table-column width="250px" align="center" label="操作" fixed="right">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="onItemEdit(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="onCheckCache(scope.row.configName)">查看缓存</el-button>
          <el-button type="warning" size="mini" @click="onClear(scope.row.configName)">清理缓存</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination @size-change="onSizeChange" @current-change="onCurrentChange" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total" />

    <el-dialog :title="form.id?'编辑配置':'新增配置'" :visible.sync="dialogFormVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入配置名称" :readonly="form.id!=null" />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="配置描述" prop="configDesc">
          <el-input v-model="form.configDesc" placeholder="请输入配置描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit()">确 定</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import {
  getFaceConfigList,
  postFaceConfig,
  getFaceConfig,
  deleteFaceConfig,
  putFaceConfig,
  getCacheToclear,
  getCacheTocheck
} from "@/api/config/manager/index";

export default {
  name: "sys-configManager",
  data() {
    return {
      form: {
        configValue: null,
        configName: null,
        configDesc: null
      },
      rules: {
        configName: [
          {
            required: true,
            message: "请输入配置名称",
            trigger: "blur"
          },
          {
            min: 3,
            max: 155,
            message: "长度在 3 到 155 个字符",
            trigger: "blur"
          }
        ]
      },
      listData: {},
      listLoading: true,
      listQuery: {
        offset: 1,
        limit: 15,
        keyword: null,
        configName: null
      },
      dialogFormVisible: false
    };
  },
  methods: {
    init() {
      this.getList();
    },
    getList() {
      this.listLoading = true;
      getFaceConfigList(this.listQuery).then(response => {
        this.listData = response.data;
        this.listLoading = false;
      });
    },
    // 重置按钮
    onResetForm() {
      this.listQuery = {
        keyword: "",
        image: ""
      };
      this.$refs.listForm.resetFields();
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    // 清除缓存
    onClear(val) {
      getCacheToclear(val).then(response => {
        let isSuccess = response.status === 200;

        this.$notify({
          title: isSuccess ? "成功" : "失败",
          message: isSuccess ? "清除成功" : "清除失败",
          type: isSuccess ? "success" : "error",
          duration: 2000
        });
      });
    },
    onCheckCache(val) {
      getCacheTocheck(val).then(response => {
        let isSuccess = response.status === 200;

        if (!isSuccess) {
          this.$notify({
            title: "失败",
            message: response.message,
            type: "error",
            duration: 2000
          });
          return;
        }

        this.$alert(`当前缓存值为：${response.data}`, "提示");
      });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.getList();
    },
    onSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    onCurrentChange(val) {
      this.listQuery.offset = val;
      this.getList();
    },
    onItemAdd() {
      this.resetTemp();
      this.dialogFormVisible = true;
    },
    onItemEdit(row) {
      getFaceConfig(row.id).then(response => {
        this.form = response.data;
        this.dialogFormVisible = true;
      });
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return false;

        if (!this.form.id) {
          postFaceConfig(this.form).then(res => {
            let isSuccess = res.status === 200;
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "新增成功" : "新增失败",
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.getList();
              this.dialogFormVisible = false;
            }
          });
        } else {
          putFaceConfig(this.form.id, this.form).then(res => {
            let isSuccess = res.status === 200;
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "修改成功" : "修改失败",
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.dialogFormVisible = false;
              this.getList();
            }
          });
        }
      });
    },
    resetTemp() {
      this.form = {
        configValue: null,
        configName: null,
        configDesc: null
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.filter-container {
  background-color: #fafbfb;
  margin: 0px;
  .form {
    height: 46px;
    line-height: 46px;
    overflow: hidden;
    font-size: 0;
    .el-form-item {
      height: auto;
      line-height: 100%;
      margin: 4px 0 0 0px;
      font-size: 0;
    }
  }
}
.el-table th {
  background: #eeeeee !important;
  color: #444444;
  /*border-width: medium;*/
  border-color: #eeeeee;
  font-size: large;
}
.el-pagination {
  padding: 10px 0 10px 10px;
}
.el-button {
  margin: 3px;
}
</style>