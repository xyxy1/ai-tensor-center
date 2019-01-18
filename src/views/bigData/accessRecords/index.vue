<template>
  <div class="app-container">
    <el-row class="main">
      <menu-tree ref="menu" @change="onMenuChange" />
      <el-col :span="18" class="right-box">
        <!-- 表单筛选 -->
        <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="getTableList">
          <span>证件号</span>
          <el-form-item prop="identityNo">
            <el-input size="mini" @keyup.enter.native="getTableList" placeholder="证件号" v-model="listQuery.identityNo" />
          </el-form-item>
          <span>通过方式</span>
          <el-form-item prop="passModel">
            <dict-select size="mini" dict-name="access_pass_model" v-model="listQuery.passModel" placeholder="全部" clearable />
          </el-form-item>
          <span>时间</span>
          <el-form-item>
            <el-date-picker size="mini" v-model="pickerValue[0]" type="datetime" @change="onStartTimeChange" placeholder="请选择开始时间" :picker-options="singlePickerOptions()" />
          </el-form-item>
          <el-form-item>
            <el-date-picker size="mini" v-model="pickerValue[1]" type="datetime" @change="onEndTimeChange" placeholder="请选择结束时间" :picker-options="singlePickerOptions(pickerValue[0])" />
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
            进出记录
            <em>{{listData.total?listData.total:0}}</em>
          </div>
        </div>

        <el-table class="table" :data="listData.rows" height="calc(100vh - 256px)" v-loading.body="listLoading" highlight-current-row>
          <el-table-column align="center" label="现场照" width="80">
            <template slot-scope="scope">
              <img-show class="pic" width="48px" height="48px" txt="暂无照片" :img-src="scope.row.passImg" />
            </template>
          </el-table-column>
          <el-table-column label="门禁名称" prop="accessName" min-width="100" />
          <el-table-column label="进/出" prop="inOut" width="80" align="center" />
          <el-table-column label="证件号" prop="identityNo" width="160" align="center" />
          <el-table-column label="卡号" prop="cardNo" min-width="80" align="center" />
          <el-table-column label="通过方式" prop="passModel" width="100" align="center" />
          <el-table-column label="访客证件号" prop="personId" width="160" align="center" />
          <el-table-column label="通过时间" prop="passTime" width="160" align="center" />
          <el-table-column label="所属社区" prop="communityName" min-width="100" align="center" />
        </el-table>

        <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" :total="listData.total" layout="total, sizes, prev, pager, next, jumper" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import moment from "moment";
import { singlePickerOptions } from "@/utils";
import {
  getAccessRecordsList,
  getCommunityTree
} from "@/api/bigData/accessRecords";
export default {
  name: "accessRecords",
  components: {
    MenuTree: () => import("./components/MenuTree")
  },
  data: () => ({
    listData: {},
    listQuery: {
      timeStart: moment()
        .subtract(1, "d")
        .format("YYYYMMDDHHmmss"),
      timeEnd: "",
      offset: 1,
      limit: 15,
      identityNo: null,
      passModel: null,
      personId: null
    },
    listLoading: false,

    pickerValue: [moment().subtract(1, "d"), ""],
    singlePickerOptions: singlePickerOptions
  }),
  methods: {
    // 获取表格数据
    getTableList() {
      this.listLoading = true;
      getAccessRecordsList(this.listQuery)
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
      this.pickerValue = [moment().subtract(1, "d"), moment()];
      this.listQuery.timeStart = moment(this.pickerValue[0]).format(
        "YYYYMMDDHHmmss"
      );
      this.listQuery.timeEnd = moment(this.pickerValue[1]).format(
        "YYYYMMDDHHmmss"
      );
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
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getTableList();
    },
    onMenuChange(row) {
      this.listQuery.accessCode = row.accessCode;
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
    .el-select,
    .el-input {
      width: 120px;
    }
    .el-date-editor {
      width: 180px;
    }
  }
  .table {
    .pic {
      display: block;
      margin: 0 auto;
      border-radius: 4px;
    }
  }
  .el-pagination {
    padding: 10px;
  }
}
</style>