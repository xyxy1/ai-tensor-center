<template>
  <div class="label-manage">
    <!-- 表单筛选 -->
    <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="onSearch">
      <span>关键字</span>
      <el-form-item prop="keyword">
        <el-input size="mini" @keyup.enter.native="onSearch" placeholder="收费项目" v-model="listQuery.keyword"></el-input>
      </el-form-item>
      <span>时间</span>
      <el-form-item prop="keyword">
        <el-date-picker size="mini" v-model="pickerValue[0]" type="datetime" @change="onStartTimeChange" placeholder="请选择开始时间" />
      </el-form-item>
      <el-form-item prop="keyword">
        <el-date-picker size="mini" v-model="pickerValue[1]" type="datetime" @change="onEndTimeChange" placeholder="请选择结束时间" />
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
      <el-table-column min-width="100" prop="feeItemName" label="收费项目" align="center" />
      <el-table-column min-width="100" prop="billTypeName" label="票据类型" align="center" />
      <el-table-column min-width="140" label="计费开始日期" align="center">
        <template slot-scope="scope">{{scope.row.billStartDate && moment(scope.row.billStartDate, "YYYYMMDD").format("YYYY-MM-DD")}}</template>
      </el-table-column>
      <el-table-column min-width="140" label="计费结束日期" align="center">
        <template slot-scope="scope">{{scope.row.billEndDate && moment(scope.row.billEndDate, "YYYYMMDD").format("YYYY-MM-DD")}}</template>
      </el-table-column>
      <el-table-column min-width="100" prop="billFee" label="应收金额" align="center" />
      <el-table-column min-width="140" label="应收日期" align="center">
        <template slot-scope="scope">{{scope.row.receivableDate && moment(scope.row.receivableDate, "YYYYMMDD").format("YYYY-MM-DD")}}</template>
      </el-table-column>
      <el-table-column min-width="100" prop="collectFee" label="实收金额" align="center" />
      <el-table-column min-width="140" label="实收日期" align="center">
        <template slot-scope="scope">{{scope.row.collectionDate && moment(scope.row.collectionDate, "YYYYMMDD").format("YYYY-MM-DD")}}</template>
      </el-table-column>
    </el-table>
    <!-- 表格模式 E -->

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total"></el-pagination>
  </div>
</template>
<script>
import moment from "moment";
import { getPropertyList } from "@/api/bigData/assetRelevance/index";

export default {
  props: {
    data: Object
  },
  data: () => ({
    moment: moment,
    listQuery: {
      offset: 1,
      limit: 15,
      timeStart: moment()
        .subtract(1, "M")
        .format("YYYYMMDDHHmmss"),
      timeEnd: "",
      keyword: null,
      mlphId: null
    },
    listIds: [],
    listData: {},
    listLoading: false,

    pickerValue: [moment().subtract(1, "M")._d, ""]
  }),
  watch: {
    data(val) {
      if (val) {
        this.listQuery.mlphId = val.id;
        this.getTableList();
      }
    }
  },
  created() {
    if (this.data) {
      this.listQuery.mlphId = this.data.id;
      this.getTableList();
    }
  },
  methods: {
    // 获取表格数据
    getTableList() {
      this.listLoading = true;

      getPropertyList(this.listQuery)
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
    onItemDetails(row) {
      // 调用全库搜
      this.$store.dispatch("allSearch/setData", row);
      this.$router.push("/searchAll");
    },
    // 列表参数重置
    onResetForm() {
      this.$refs.listForm.resetFields();
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    // 日期选择器变更
    onStartTimeChange(date) {
      this.listQuery.timeStart = date
        ? moment(date).format("YYYYMMDDHHmmss")
        : "";
    },
    onEndTimeChange(date) {
      this.listQuery.timeEnd = date
        ? moment(date).format("YYYYMMDDHHmmss")
        : "";
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
.label-manage {
  .el-button {
    margin-left: 0;
  }
  .el-pagination {
    padding: 10px;
  }
  .form {
    height: 46px;
    line-height: 46px;
    padding: 0 12px 0 4px;
    span {
      display: inline-block;
      margin-left: 8px;
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
    .el-date-editor {
      width: 180px;
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