<template>
  <div class="app-container">
    <!-- 表单筛选 -->
    <el-form class="form" @keyup.enter.native="getTableList">
      <span>关键字</span>
      <picture-search ref="pictureSearch" size="mini" placeholder="名称/证件号" @change="onSearchChange"></picture-search>
      <span>时间</span>
      <el-date-picker size="mini" v-model="pickerValue" type="datetimerange" :picker-options="pickerOptions" range-separator="|" @change="onPickerChange" start-placeholder="开始日期" end-placeholder="结束日期" align="center" :clearable="false" :editable="false" />
      <span>任务</span>
      <el-select size="mini" v-model="listQuery.monitorIds" placeholder="全部" clearable>
        <el-option v-for="item in taskData" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <span>摄像头</span>
      <el-select size="mini" v-model="listQuery.cameraIds" placeholder="全部" clearable>
        <el-option v-for="item in cameraData" :key="item.cameraId" :label="item.cameraName" :value="item.cameraId" />
      </el-select>
      <span>状态</span>
      <el-select size="mini" v-model="listQuery.handleFlag" placeholder="全部" clearable>
        <el-option label="未处理" value="0" />
        <el-option label="已处理" value="1" />
      </el-select>
      <el-button size="mini" type="primary" @click="getTableList">查询</el-button>
      <el-button size="mini" @click="onResetForm">重置</el-button>
    </el-form>

    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        告警消息
        <em>{{listTableData.total?listTableData.total:0}}</em>
      </div>
    </div>

    <!-- 表格模式 S -->
    <el-table ref="listTabel" :data="listTableData.rows" height="calc(100vh - 255px)" v-loading.body="listTableLoading" highlight-current-row @selection-change="onListChange">
      <el-table-column label="序号" align="center" type="index" width="50" />
      <el-table-column label="抓拍照片" align="center" width="80">
        <template slot-scope="scope">
          <img-show class="pic" width="48px" height="48px" text="暂无照片" base64 :img-src="scope.row.snapImg" />
        </template>
      </el-table-column>
      <el-table-column label="相似度" align="center" width="80">
        <template slot-scope="scope">{{scope.row.similarity}}%</template>
      </el-table-column>
      <el-table-column label="证件照片" align="center" width="80">
        <template slot-scope="scope">
          <img-show class="pic" width="48px" height="48px" text="暂无照片" :img-src="scope.row.identityImgUrl" />
        </template>
      </el-table-column>
      <el-table-column label="背景图" align="center" width="120">
        <template slot-scope="scope">
          <a @click="onLookPicture(scope.row.snapBgImgUrl)">
            <img-show height="48px" txt="暂无背景" :img-src="scope.row.snapBgImgUrl" class="bg-pic" />
          </a>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名/证件号" width="180px">
        <template slot-scope="scope">
          <div class="identity txt">
            <label>{{scope.row.name}}</label>
            <p>{{scope.row.identityNo}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类别" align="center" min-width="120px">
        <template slot-scope="scope">
          <div class="label-box">
            <span class="label-item" v-if="scope.row.labelNames" v-for="(label,index) in scope.row.labelNames.split(',')" :key="index" :style="{backgroundColor:label.split('|')[1],color:colorBrightness(label.split('|')[1])}">{{label.split('|')[0]}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" width="60" prop="sex" label="性别" />
      <el-table-column align="center" width="60" prop="age" label="年龄" />
      <el-table-column align="center" prop="cameraName" label="摄像头" />
      <el-table-column align="center" min-width="120" prop="monitorName" label="布控任务" />
      <el-table-column prop="snapTime" min-width="160" label="抓拍时间" />
      <el-table-column label="处理状态" min-width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.handleFlag == 1 ? 'primary' : 'danger'" close-transition>
            <span>{{scope.row.handleFlag == 1 ? '已处理' : '未处理'}}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="130" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onDetails(scope.row.id)" :plain="scope.row.handleFlag == 1">{{scope.row.handleFlag == 1 ? '详情' : '处理'}}</el-button>
          <el-button size="mini" type="primary" @click="onOpenLayer(scope.row)">轨迹</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格模式 E -->
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total"></el-pagination>

    <!-- 以图搜图 - 弹窗 -->
    <picture-layer ref="pictureLayer" jump />

    <!-- 图片弹窗 -->
    <el-dialog title="背景大图" :visible.sync="isBgDialog">
      <img :src="rowBgImg" class="w100">
    </el-dialog>

    <!-- 处理弹窗 -->
    <dispose-layer :is-open.sync="isDisposeDialog" :data="disposeData" @complete="getTableList" />
  </div>
</template>
<script>
import moment from "moment";
import { pickerOptions } from "@/utils";
import { getSelectData } from "@/api/camera";
import { getMonitorTaskSelect } from "@/api/bigData/monitorTask";
import { postAlarmList, getAlarmDetail } from "@/api/bigData/alarmNews";

export default {
  name: "alarmNews",
  components: {
    DisposeLayer: () => import("./components/DisposeLayer")
  },
  data: () => ({
    moment: moment,
    isBgDialog: false, // 控制背景图显示
    rowBgImg: null,

    isDisposeDialog: false,
    disposeData: null,

    listQuery: {
      timeStart: moment()
        .subtract(1, "d")
        .format("YYYYMMDDHHmmss"),
      timeEnd: moment().format("YYYYMMDDHHmmss"),
      keyword: "",
      image: "",
      cameraIds: null,
      handleFlag: null,
      monitorIds: null,
      offset: 1,
      limit: 15
    },
    listIds: [],
    listTableData: {},
    listTableLoading: false,

    cameraData: [],
    taskData: [],

    pickerValue: [moment().subtract(1, "d"), moment()],
    pickerOptions: pickerOptions
  }),
  created() {
    this.initData();
    this.getTableList();
  },
  methods: {
    async initData() {
      await getSelectData().then(res => {
        this.cameraData = res.data;
      });
      await getMonitorTaskSelect().then(res => {
        this.taskData = res.data;
      });
    },
    // 日期选择器变更
    onPickerChange(date) {
      if (!date) return;
      this.listQuery.timeStart = moment(date[0]).format("YYYYMMDDHHmmss");
      this.listQuery.timeEnd = moment(date[1]).format("YYYYMMDDHHmmss");
    },
    onSearchChange(val, img) {
      this.listQuery.keyword = val;
      this.listQuery.image = img;
    },
    getTableList() {
      this.listTableLoading = true;
      postAlarmList(this.listQuery)
        .then(res => {
          this.listTableData = res.data;
        })
        .finally(() => {
          this.listTableLoading = false;
        });
    },
    onResetForm() {
      this.listQuery = {
        timeStart: moment()
          .subtract(1, "d")
          .format("YYYYMMDDHHmmss"),
        timeEnd: moment().format("YYYYMMDDHHmmss"),
        keyword: "",
        image: "",
        cameraIds: null,
        handleFlag: null,
        monitorIds: null,
        offset: 1,
        limit: 15
      };
      this.pickerValue = [moment().subtract(1, "d"), moment()];
      this.$refs.pictureSearch.reset();
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
    // 查看大图
    onLookPicture(url) {
      this.rowBgImg = url;
      this.isBgDialog = true;
    },
    // 查看底库资料
    onDetails(id) {
      getAlarmDetail(id).then(res => {
        let isSuccess = res.status === 200;
        if (!isSuccess) {
          // 错误提示处理
          this.$notify({
            title: "失败",
            message: res.message,
            type: "error",
            duration: 2000
          });
          return;
        }

        this.disposeData = res.data;
        this.$nextTick(() => {
          this.isDisposeDialog = true;
        });
      });
    },
    // 打开以图搜图
    onOpenLayer(row) {
      this.$refs.pictureLayer.open({
        keyword: row.identityNo,
        image: "data:image/jpeg;base64," + row.snapImg
      });
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@/styles/alarmNews.scss";
</style>
