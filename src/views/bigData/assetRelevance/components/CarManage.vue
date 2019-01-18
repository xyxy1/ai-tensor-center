<template>
  <div class="car-manage">
    <!-- 表单筛选 -->
    <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="onSearch">
      <span>关键字</span>
      <el-form-item prop="keyword">
        <el-input size="mini" @keyup.enter.native="onSearch" placeholder="车牌号" v-model="listQuery.keyword"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="onSearch">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格模式 S -->
    <el-table ref="listTabel" :data="listData.rows" height="calc(100vh - 260px)" v-loading.body="listLoading" highlight-current-row @selection-change="onListChange">
      <!-- <el-table-column type="selection" width="50" /> -->
      <el-table-column width="100" prop="plateNo" label="车牌号" align="center" />
      <el-table-column width="120" prop="name" label="车主姓名" align="center" />
      <el-table-column width="140" prop="phone" label="联系方式" align="center" />
      <el-table-column prop="address" label="车主居住地址" />
      <el-table-column fixed="right" width="180" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="onItemDetails(scope.row, 0)">抓拍记录</el-button>
          <el-button size="mini" type="success" @click="onItemDetails(scope.row, 1)">告警记录</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格模式 E -->

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total"></el-pagination>
  </div>
</template>
<script>
import { getCarList } from "@/api/bigData/assetRelevance/index";

export default {
  props: {
    data: Object
  },
  data: () => ({
    listQuery: {
      offset: 1,
      limit: 15,
      keyword: null,
      communityCode: null,
      mlphId: null
    },
    listIds: [],
    listData: {},
    listLoading: false
  }),
  watch: {
    data(val) {
      if (val) {
        this.listQuery.communityCode = val.communityCode;
        this.listQuery.mlphId = val.id;
        this.getTableList();
      }
    }
  },
  methods: {
    // 获取表格数据
    getTableList() {
      this.listLoading = true;

      getCarList(this.listQuery)
        .then(res => {
          if (res.status === 200) {
            this.listData = res.data;
          }
        })
        .finally(err => {
          this.listLoading = false;
        });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.listQuery.limit = 15;
      this.getTableList();
    },
    // 人员详情
    onItemDetails(row, type) {
      if (type == 0) {
        this.$router.push({
          name: "车辆抓拍",
          params: { data: row.plateNo }
        });
      }
      if (type == 1) {
        this.$router.push({
          name: "车辆告警",
          params: { data: row.plateNo }
        });
      }
    },
    // 列表参数重置
    onResetForm() {
      this.$refs.listForm.resetFields();
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
    }
  }
};
</script>
<style lang="scss" scoped>
.car-manage {
  .el-button {
    margin-left: 0;
  }
  .el-pagination {
    padding: 10px;
  }
  .form {
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
  .el-table {
    .pic {
      display: block;
      width: 50px;
      height: 62px;
      margin: 0 auto;
    }
    .identity {
      line-height: 140%;
      label {
        font-size: 14px;
      }
      p {
        color: #9da5af;
      }
    }
    .label-box {
      padding: 4px 0 0;
    }
    .label-item {
      display: inline-block;
      height: 22px;
      line-height: 18px;
      padding: 0 3px;
      margin: 0 4px 4px;
      text-align: center;
      border: 2px #fff solid;
      border-radius: 99px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      font-size: 12px;
      color: #fff;
    }
  }
}
</style>