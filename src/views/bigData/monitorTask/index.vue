<template>
  <div class="app-container">
    <!-- 表单筛选 -->
    <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="getTableList">
      <span>关键字</span>
      <el-form-item prop="keyword">
        <el-input size="mini" @keyup.enter.native="getTableList" placeholder="任务名/任务编号" v-model="listQuery.keyword" />
      </el-form-item>
      <span>区域</span>
      <el-form-item prop="communityCode">
        <el-select size="mini" v-model="listQuery.communityCode" placeholder="全部" clearable>
          <el-option v-for="item in communityData" :key="item.communityCode" :label="item.communityName" :value="item.communityCode" />
        </el-select>
      </el-form-item>
      <span>时间</span>
      <el-form-item prop="timeStart">
        <el-date-picker size="mini" v-model="pickerValue[0]" type="datetime" @change="onStartTimeChange" placeholder="请选择开始时间" :picker-options="singlePickerOptions()" />
      </el-form-item>
      <el-form-item prop="timeEnd">
        <el-date-picker size="mini" v-model="pickerValue[1]" type="datetime" @change="onEndTimeChange" placeholder="请选择结束时间" :picker-options="singlePickerOptions(pickerValue[0])" />
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="getTableList">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        我的布控
        <em>{{listTableData.total?listTableData.total:0}}</em>
      </div>
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
      </div>
    </div>

    <!-- 表格模式 S -->
    <el-table ref="listTabel" :data="listTableData.rows" height="calc(100vh - 255px)" v-loading.body="listTableLoading" highlight-current-row>
      <el-table-column label="序号" align="center" type="index" width="50" />
      <el-table-column width="100" prop="code" label="任务编号" />
      <el-table-column prop="name" label="任务名称" />
      <el-table-column prop="areaNames" label="布控区域" />
      <el-table-column label="布控时间" widht="180" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.timeFlag == '0'">长期有效</div>
          <div v-else>
            从：{{scope.row.timeStart}}<br />
            至：{{scope.row.timeEnd}}
          </div>
        </template>
      </el-table-column>
      <el-table-column width="80" align="center" label="相似度">
        <template slot-scope="scope">{{scope.row.similarity}}%</template>
      </el-table-column>
      <el-table-column width="80" prop="num" align="center" label="告警次数" />
      <el-table-column width="80" prop="status" align="center" label="状态" />
      <el-table-column fixed="right" width="140" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemDetails(scope.row.id)">详情</el-button>
          <el-button size="mini" type="primary" @click="onItemEdit(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格模式 E -->

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total" />

    <!-- 编辑表单 -->
    <task-form ref="taskForm" :is-open.sync="isFormDialog" :id="taskFormId" @complete="getTableList" />

    <!-- 任务详情 -->
    <task-details ref="taskDetails" :is-open.sync="isDetailsDialog" :id="taskDetailsId" />
  </div>
</template>
<script>
import moment from "moment";
import { singlePickerOptions } from "@/utils";

import { getMonitorTaskList } from "@/api/bigData/monitorTask/index";
import { getCommunityList } from "@/api/bigData/community";

export default {
  name: "monitorTask",
  components: {
    TaskForm: () => import("./components/TaskForm"),
    TaskDetails: () => import("./components/TaskDetails")
  },
  data: () => ({
    listQuery: {
      timeStart: moment()
        .subtract(1, "d")
        .format("YYYYMMDDHHmmss"),
      timeEnd: "",
      keyword: "",
      communityCode: "",
      status: "",
      offset: 1,
      limit: 15
    },
    listTableData: {},
    listTableLoading: false,

    communityData: [],

    taskFormId: null,
    isFormDialog: false,

    taskDetailsId: null,
    isDetailsDialog: false,

    pickerValue: [moment().subtract(1, "d")._d, ""],
    singlePickerOptions: singlePickerOptions
  }),
  created() {
    this.init();
  },
  methods: {
    init() {
      getCommunityList().then(res => {
        this.communityData = res.data;
      });
      this.getTableList();
    },
    getTableList() {
      this.taskFormId = null;
      this.taskDetailsId = null;

      this.listTableLoading = true;
      getMonitorTaskList(this.listQuery)
        .then(res => {
          this.listTableData = res.data;
        })
        .finally(() => {
          this.listTableLoading = false;
        });
    },
    onResetForm() {
      this.$refs.listForm.resetFields();
      this.pickerValue = [moment().subtract(1, "d")._d, ""];
    },
    // 表单编辑
    onItemEdit(id) {
      this.taskFormId = id || null;
      this.$nextTick(() => {
        this.isFormDialog = true;
      });
    },
    // 任务详情
    onItemDetails(id) {
      this.taskDetailsId = id || null;
      this.$nextTick(() => {
        this.isDetailsDialog = true;
      });
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
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  position: relative;
  height: 100%;
  .w100 {
    width: 100%;
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
      width: 140px;
    }
    .el-date-editor {
      width: 180px;
    }
  }
  .el-pagination {
    padding: 10px;
  }
}
</style>