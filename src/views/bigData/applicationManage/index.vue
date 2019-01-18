<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="common-tool">
      <!-- 表单筛选 -->
      <el-form class="form" @keyup.enter.native="onSearch">
        <span>关键字</span>
        <el-input size="mini" @keyup.enter.native="onSearch" placeholder="采集系统名称" v-model="listQuery.keyword"></el-input>
        <el-button size="mini" type="primary" @click="onSearch">查询</el-button>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form>
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-delete" @click="onItemDelete">删除</el-button>
      </div>
    </div>

    <el-table class="table" :data="listData.rows" height="calc(100vh - 210px)" v-loading.body="listLoading" highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="名称" prop="name" align="center" />
      <el-table-column label="所属居委会" min-width="100" prop="sqjcwhName" align="center" />
      <el-table-column label="所属派出所" min-width="100" prop="pcsName" align="center" />
      <el-table-column label="小区" prop="communityName" align="center" />
      <el-table-column label="类型" prop="apsType" align="center" />
      <el-table-column fixed="right" min-width="80" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemEdit(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" :total="listData.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>

    <!-- 表单编辑 -->
    <application-form :id="formId" :is-open.sync="isFormDialog" @complete="getTableList" />
  </div>
</template>
<script>
import {
  getApplicationList,
  deleteApplication
} from "@/api/bigData/applicationManage/index";

export default {
  name: "configTerminal",
  components: {
    ApplicationForm: () => import("./components/ApplicationForm")
  },
  data: () => ({
    isFormDialog: false, // 控制表单显示
    formId: null,
    rules: {
      accessName: { required: true, message: "名称不能为空" },
      accessCode: { required: true, message: "代码不能为空" }
    },

    listIds: [],
    listData: {},
    listQuery: {
      offset: 1,
      limit: 15,
      keyword: null
    },
    listLoading: false
  }),
  created() {
    this.getTableList();
  },
  methods: {
    // 获取表格数据
    getTableList() {
      this.formId = null;
      this.listLoading = true;
      getApplicationList(this.listQuery)
        .then(res => {
          this.listData = res.data;
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.listQuery.limit = 15;
      this.getTableList();
    },
    // 列表参数重置
    onResetForm() {
      this.listQuery = {
        offset: 1,
        limit: 15,
        keyword: null
      };
    },
    // 表单编辑
    onItemEdit(id) {
      this.formId = id || null;
      this.isFormDialog = true;
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
        deleteApplication({
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
.app-container {
  position: relative;
  height: 100%;
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
