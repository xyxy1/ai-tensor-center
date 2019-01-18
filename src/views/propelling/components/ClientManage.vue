<template>
  <div class="client-manage">
    <!-- 工具栏 -->
    <div class="common-tool">
      <!-- 表单筛选 -->
      <el-form class="form" @keyup.enter.native="getTableList">
        <span>关键字</span>
        <el-input size="mini" @keyup.enter.native="getTableList" placeholder="名称/编码" v-model="listQuery.keyword"></el-input>
        <el-button size="mini" type="primary" @click="getTableList">查询</el-button>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form>
    </div>

    <el-table class="table" :data="listData.rows" height="calc(100vh - 256px)" v-loading.body="listLoading" highlight-current-row>
      <el-table-column label="摄像头名称" prop="cameraName" min-width="100" align="center" />
      <el-table-column label="摄像头编码" prop="cameraCode" min-width="100" align="center" />
      <el-table-column label="最后心跳时间" prop="connTime" width="160" align="center" />
      <el-table-column label="回调地址" prop="callbackUrl" min-width="200" />
      <el-table-column label="创建人/创建时间" width="180">
        <template slot-scope="scope">
          <div class="group">
            <label>{{scope.row.crtName}}</label>
            <p>{{scope.row.crtTime}}</p>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" :total="listData.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
  </div>
</template>
<script>
import {
  page
  // addObj,
  // getObj,
  // delObj,
  // putObj,
  // getTest
} from "@/api/faceModule/conn/index";

export default {
  data: () => ({
    listIds: [],
    listData: {},
    listQuery: {
      offset: 1,
      limit: 15,
      keyword: null
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
    // 列表参数重置
    onResetForm() {
      this.listQuery = {
        offset: 1,
        limit: 15,
        keyword: null
      };
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
.client-manage {
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
