<template>
  <div class="app-container">
    <el-row class="main">
      <menu-tree ref="menu" @change="onMenuChange" />
      <el-col :span="18" class="right-box">
        <!-- 表单筛选 -->
        <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="onSearch">
          <span>关键字</span>
          <el-form-item prop="keyword">
            <el-input size="mini" @keyup.enter.native="onSearch" placeholder="名称/代码" v-model="listQuery.keyword" />
          </el-form-item>
          <el-form-item>
            <el-button size="mini" type="primary" @click="onSearch">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" @click="onResetForm">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 工具栏 -->
        <div class="common-tool">
          <div class="title">
            门禁设备
            <em>{{listData.total?listData.total:0}}</em>
          </div>
        </div>

        <el-table class="table" :data="listData.rows" height="calc(100vh - 256px)" v-loading.body="listLoading" highlight-current-row>
          <el-table-column label="名称" prop="accessName" min-width="60" />
          <el-table-column label="代码" prop="accessCode" min-width="60" />
          <el-table-column label="设备类型" prop="accessType" width="100" align="center" />
          <el-table-column label="所属社区" prop="communityName" min-width="100" align="center" />
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
        </el-table>

        <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" :total="listData.total" layout="total, sizes, prev, pager, next, jumper" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { getAccessList } from "@/api/bigData/accessDevice";
export default {
  name: "accessDevice",
  components: {
    MenuTree: () => import("./components/MenuTree")
  },
  data: () => ({
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
      this.listLoading = true;
      getAccessList(this.listQuery)
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
    onResetForm() {
      this.$refs.listForm.resetFields();
    },
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getTableList();
    },
    onMenuChange(row) {
      this.listQuery.communityCode = row.communityCode;
      this.getTableList();
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container,
.main {
  position: relative;
  height: 100%;
  & > .el-col {
    height: 100%;
  }
  .form {
    background: #fafbfd;
    height: 46px;
    line-height: 46px;
    overflow: hidden;
    font-size: 0;
    span {
      display: inline-block;
      padding-left: 10px;
      text-align: right;
      font-size: 13px;
      color: #3f4041;
    }
    .el-form-item {
      height: auto;
      line-height: 100%;
      margin: 4px 0 0 6px;
      font-size: 0;
    }
    .el-input {
      width: 180px;
    }
  }
  .el-pagination {
    padding: 10px;
  }
}
</style>