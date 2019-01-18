<template>
  <div class="police-manage">

    <!-- 表单筛选 -->
    <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="onSearch">
      <label>关键字</label>
      <el-form-item prop="keyword">
        <el-input size="mini" @keyup.enter.native="onSearch" placeholder="派出所名称/编码" v-model="listQuery.keyword"></el-input>
      </el-form-item>
      <label>区域</label>
      <el-form-item>
        <el-cascader size="mini" placeholder="请选择省市县" :options="cascaderOptions" :props="cascaderProps" v-model="currentArea" @change="onCascaderChange" clearable filterable change-on-select />
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="onSearch">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form-item>
      <el-form-item prop="provinceCode" class="m0" />
      <el-form-item prop="cityCode" class="m0" />
      <el-form-item prop="townCode" class="m0" />
    </el-form>

    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        派出所
        <em v-if="listData.total">{{listData.total}}</em>
      </div>
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-delete" @click="onItemDelete">删除</el-button>
      </div>
    </div>

    <!-- 表格模式 S -->
    <el-table ref="listTabel" :data="listData.rows" height="calc(100vh - 302px)" v-loading.body="listLoading" highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="code" label="编码" width="120" align="center" />
      <el-table-column prop="name" label="名称" min-width="100px" />
      <el-table-column label="所属区域" min-width="100">
        <template slot-scope="scope">
          {{scope.row.provinceName+'/'+scope.row.cityName+'/'+scope.row.townName}}
        </template>
      </el-table-column>
      <el-table-column label="创建人/创建时间" width="160">
        <template slot-scope="scope">
          <div class="group">
            <label>{{scope.row.crtName}}</label>
            <p>{{scope.row.crtTime}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="更新人/更新时间" width="160">
        <template slot-scope="scope">
          <div class="group">
            <label>{{scope.row.updName}}</label>
            <p>{{scope.row.updTime}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="80" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemEdit(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格模式 E -->

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total"></el-pagination>

    <!-- 表单编辑 -->
    <police-form :id="formId" :is-open.sync="isFormDialog" :area-data="cascaderOptions" @complete="onSearch" />
  </div>
</template>
<script>
import {
  getAreaTree,
  getPoliceList,
  postPolice,
  deletePolice,
  putPolice,
  getPolice
} from "@/api/bigData/responsibilityArea";

export default {
  components: {
    PoliceForm: () => import("./form")
  },
  data: () => ({
    currentArea: [],
    cascaderOptions: [],
    cascaderProps: {
      value: "code"
    },

    formId: null,
    isFormDialog: false,
    listIds: [],
    listData: {},
    listQuery: {
      offset: 1,
      limit: 15,
      provinceCode: null,
      cityCode: null,
      townCode: null,
      keyword: null
    },
    listLoading: false
  }),
  methods: {
    init() {
      getAreaTree().then(res => {
        if (res.status == 200) {
          this.cascaderOptions = res.data;
        }
      });
      this.getTableList();
    },
    // 获取表格数据
    getTableList() {
      this.listLoading = true;
      getPoliceList(this.listQuery)
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
    onCascaderChange(val) {
      this.listQuery.provinceCode = val[0];
      this.listQuery.cityCode = val[1];
      this.listQuery.townCode = val[2];
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
    // 表单编辑
    onItemEdit(id, isReadonly) {
      this.formId = id || null;
      this.$nextTick(() => {
        this.isFormDialog = true;
      });
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
        deletePolice({
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
    // 列表参数重置
    onResetForm() {
      this.$refs.listForm.resetFields();
      this.currentArea = [];
    }
  }
};
</script>
<style lang="scss" scoped>
.police-manage {
  .form {
    background: #fafbfd;
    height: 46px;
    line-height: 46px;
    label {
      display: inline-block;
      margin: 0 2px 0 10px;
      vertical-align: top;
      font-size: 13px;
      font-weight: normal;
      color: #3f4041;
    }
    .el-form-item {
      height: auto;
      line-height: 100%;
      margin: 4px 0 0;
      font-size: 0;
    }
    .el-cascader {
      width: 260px;
      vertical-align: initial;
    }
  }
  .el-table {
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