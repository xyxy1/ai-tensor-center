<template>
  <div class="trajectory-main">
    <!-- 表单筛选 -->
    <el-form class="form" @keyup.enter.native="onSubmit">
      <div class="title">轨迹分析</div>
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="isPictureDialog=true">选择分析对象</el-button>
      <el-button-group class="switch">
        <el-button :type="mode===1?'primary':'info'" @click="mode=1" size="mini">
          <svg-icon icon-class="category" />
        </el-button>
        <el-button :type="mode===0?'primary':'info'" @click="mode=0" size="mini">
          <svg-icon icon-class="images" />
        </el-button>
      </el-button-group>
    </el-form>

    <!-- 以图搜图 - 弹窗 -->
    <picture-layer :is-open.sync="isPictureDialog" @complete="personnelConfirm"></picture-layer>

    <!-- 数据展示 -->
    <div class="main">
      <transition name="fade" mode="out-in">
        <!-- 地图展示 -->
        <div class="map-show" v-show="mode===0">
          <!-- 地图展示 -->
          <a-map :play.sync="timeSchedulePlay" :listData="listData" :index="mapIndex" :currentUser="currentUser" :listQuery.sync="listQuery" ref="aMap" />

          <!-- 地图菜单 -->
          <div class="map-menu" v-if="currentUser">
            <div class="form-box">
              <div class="current-user">
                <div class="toggle" @click="toggle = !toggle">{{toggle?'收缩':'展开'}}</div>
                <img-show class="pic" width="48px" height="48px" text="暂无头像" :img-src="currentUser.identityImgUrl" />
                <div class="name">
                  {{currentUser.name}}
                  <div class="label-box">
                    <span class="label-item" v-for="(item,index) in currentUser.shortNames.split(',')" :key="index" :style="{backgroundColor:item.split('|')[1],color:colorBrightness(item.split('|')[1])}">{{item.split('|')[0]}}</span>
                  </div>
                </div>
                <div class="identity">{{currentUser.identityNo}}</div>
              </div>
              <el-form size="mini" :model="listQuery" label-width="36px" v-show="toggle">
                <el-form-item label="时间" prop="timeStart">
                  <el-date-picker v-model="time.start" type="datetime" format="yyyy-MM-dd HH:mm:ss" @change="onStartTimeChange" placeholder="请选择开始时间" :editable="false" :clearable="false" :picker-options="singlePickerOptions()" />
                </el-form-item>
                <el-form-item label="至" prop="timeEnd">
                  <el-date-picker v-model="time.end" type="datetime" format="yyyy-MM-dd HH:mm:ss" @change="onEndTimeChange" placeholder="请选择结束时间" :editable="false" :clearable="false" :picker-options="singlePickerOptions(time.start)" />
                </el-form-item>
                <el-button type="success" @click="onSubmit">深度分析</el-button>
              </el-form>
            </div>
            <div class="user-list">
              <div class="tit">
                轨迹列表：
                <em>{{listData.length}}</em>
              </div>
              <ul>
                <li v-for="(item,index) in listData" :key="index" :class="{sel:index==currentUserIndex}" @click="onMarkerChange(item,index)">
                  <img-show class="pic" width="48px" height="48px" base64 text="暂无头像" :img-src="item.snapImg" />
                  <div class="icon">{{index+1}}</div>
                  <label>{{item.cameraName}}</label>
                  <p>{{item.imgTime}}</p>
                </li>
              </ul>
            </div>
          </div>

          <!-- 时间进度 -->
          <time-schedule :play.sync="timeSchedulePlay" :startTime="scheduleTime.startTime" :endTime="scheduleTime.endTime" :listData="listData" @change="onScheduleChange"></time-schedule>
        </div>
      </transition>

      <transition name="fade" mode="out-in">
        <!-- 列表展示 -->
        <div class="list-show" v-show="mode===1">
          <div class="null-data" v-if="!listTableData.rows">
            暂无数据，请
            <span @click="isPictureDialog=true">选择分析对象</span>
          </div>
          <template v-else>
            <!-- 表单筛选 -->
            <el-form class="list-form" size="mini" :model="listQuery" :inline="true" @keyup.enter.native="onSubmit">
              <div class="user-info">
                <img-show class="pic" width="48px" height="48px" text="暂无头像" :img-src="currentUser.identityImgUrl" />
                <div class="name">
                  <b>{{currentUser.name}}</b>
                  <div class="label-box">
                    <span class="label-item" v-for="(item,index) in currentUser.shortNames.split(',')" :key="index" :style="{backgroundColor:item.split('|')[1],color:colorBrightness(item.split('|')[1])}">{{item.split('|')[0]}}</span>
                  </div>
                </div>
                <p>{{currentUser.identityNo}}</p>
              </div>
              <div class="txt">时间</div>
              <el-form-item class="w-a">
                <el-date-picker size="mini" v-model="pickerValue" type="datetimerange" :picker-options="pickerOptions" range-separator="|" @change="onPickerChange" start-placeholder="开始日期" end-placeholder="结束日期" align="center" :clearable="false" :editable="false" />
              </el-form-item>
              <el-form-item>
                <el-button type="success" @click="onSubmit">深度分析</el-button>
              </el-form-item>
              <div class="total">
                <span>{{listTableData.total}}</span>条
              </div>
            </el-form>

            <el-table :data="listTableData.rows" class="table" v-loading="listTableLoading" height="calc(100vh - 270px)">
              <el-table-column align="center" label="抓拍照片" width="140">
                <template slot-scope="scope">
                  <img-show width="48px" height="48px" txt="暂无图片" base64 :img-src="scope.row.snapImg" />
                </template>
              </el-table-column>
              <el-table-column align="center" label="背景图" width="180">
                <template slot-scope="scope">
                  <a @click="onLookPicture(scope.row.bgImgUrl)">
                    <img-show height="48px" class="img-auto" txt="暂无背景" :img-src="scope.row.bgImgUrl" />
                  </a>
                </template>
              </el-table-column>
              <el-table-column width="180px" prop="name" label="姓名/证件号">
                <template slot-scope="scope">
                  <div class="identity txt">
                    <label>{{scope.row.name}}</label>
                    <p>{{scope.row.identityNo}}</p>
                  </div>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="similarity" label="相似度"></el-table-column>
              <el-table-column align="center" prop="cameraName" label="抓拍地点">
                <template slot-scope="scope">
                  <el-tooltip placement="right" :open-delay="200" effect="light">
                    <div slot="content">
                      <iframe :src="'https://m.amap.com/navi/?dest='+scope.row.lng+','+scope.row.lat+'&destName='+scope.row.cameraName+'&hideRouteIcon=1&key=d25d6295beb6a7baf473a1a6d5b2eca7'" class="map-marker"></iframe>
                    </div>
                    <span class="look-map">
                      <svg-icon icon-class="locale" />{{scope.row.cameraName}}
                    </span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="imgTime" label="抓拍时间"></el-table-column>
            </el-table>

            <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" :total="listTableData.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
          </template>
        </div>
      </transition>
    </div>

    <!-- 图片弹窗 -->
    <el-dialog title="背景大图" :visible.sync="isBgDialog">
      <img :src="rowBgImg" class="w100">
    </el-dialog>
  </div>
</template>
<script>
import moment from "moment";
import { pickerOptions, singlePickerOptions } from "@/utils";
import {
  getUsetTrajectory,
  getTrajectoryList,
  getPersonnelList
} from "@/api/trajectory";

export default {
  name: "trajectory",
  components: {
    AMap: () => import("./components/AMap"),
    TimeSchedule: () => import("./components/TimeSchedule")
  },
  data: () => ({
    mode: 0,
    mapIndex: 0,
    isDialog: false,
    isPictureDialog: false,
    listQuery: {
      timeStart: moment()
        .subtract(1, "d")
        .format("YYYYMMDDHHmmss"),
      timeEnd: moment().format("YYYYMMDDHHmmss"),
      identityNo: null,
      offset: 1,
      limit: 15
    },
    isInitData: [true, true], // 用于判断是否需要初始化地图或列表数据。避免重复请求接口
    currentUser: null,
    listData: [], // 轨迹坐标返回的数据
    listTableData: {}, // 轨迹列表返回的数据
    listTableLoading: false,
    scheduleTime: {
      startTime: null,
      endTime: null
    },
    pickerValue: [moment().subtract(1, "d"), moment()],
    time: {
      start: moment().subtract(1, "d")._d,
      end: moment()._d
    },
    timeSchedulePlay: false,

    currentUserIndex: null,
    toggle: true, // true展开，false收缩
    pickerOptions: pickerOptions,
    singlePickerOptions: singlePickerOptions,

    isBgDialog: false, // 控制背景图显示
    rowBgImg: null
  }),
  watch: {
    mode(val) {
      this.timeSchedulePlay = false;
      if (this.isInitData[val] && this.listQuery.identityNo) {
        this.$set(this.isInitData, val, false);
        this.onSubmit();
      }
    },
    listQuery: {
      handler: function(val) {
        this.isInitData = [true, true];
      },
      deep: true
    }
  },
  activated() {
    this.personnelConfirm(this.$route.params.data);
  },
  methods: {
    // 地图点变更
    onMarkerChange(item, index) {
      // 停止播放
      this.timeSchedulePlay = false;

      this.currentUserIndex = index;
      this.$refs.aMap.onClickMarker({
        lng: item.lng,
        lat: item.lat,
        index: index
      });
    },
    // 进度变更
    onScheduleChange(val) {
      this.mapIndex = val;
    },
    onStartTimeChange(date) {
      if (!date) return;
      this.$set(this.pickerValue, 0, moment(date));
      this.listQuery.timeStart = moment(date).format("YYYYMMDDHHmmss");
    },
    onEndTimeChange(date) {
      if (!date) return;
      this.$set(this.pickerValue, 1, moment(date));
      this.listQuery.timeEnd = moment(date).format("YYYYMMDDHHmmss");
    },
    onPickerChange(date) {
      if (!date) return;

      this.time = {
        start: moment(date[0])._d,
        end: moment(date[1])._d
      };
      this.listQuery.timeStart = moment(date[0]).format("YYYYMMDDHHmmss");
      this.listQuery.timeEnd = moment(date[1]).format("YYYYMMDDHHmmss");
    },
    // 轨迹分析提交
    onSubmit() {
      // 空数据过滤
      if (!this.listQuery.identityNo) {
        this.$notify({
          title: "提示",
          message: "请先选择一个人员",
          type: "warning",
          duration: 2000
        });
        return;
      }

      let type = this.mode;
      this.$set(this.isInitData, type, false);
      // 地图模式。且需要初始化数据
      if (type === 0) {
        this.currentUserIndex = null;
        // 获取用户轨迹
        getUsetTrajectory(this.listQuery).then(res => {
          let isSuccess = res.status === 200;
          // 错误处理
          if (!isSuccess) {
            this.$notify({
              title: "失败",
              message: res.message,
              type: "error",
              duration: 2000
            });
            return;
          }

          this.listData = res.data.rows;
          this.mapIndex = this.listData.length;
          this.scheduleTime.startTime = moment(this.time.start).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          this.scheduleTime.endTime = moment(this.time.end).format(
            "YYYY-MM-DD HH:mm:ss"
          );
        });
      }

      // 列表模式。且需要初始化数据
      if (type === 1) {
        this.listTableLoading = true;
        getTrajectoryList(this.listQuery)
          .then(res => {
            let isSuccess = res.status === 200;
            // 错误处理
            if (!isSuccess) {
              this.$notify({
                title: "失败",
                message: res.message,
                type: "error",
                duration: 2000
              });
              return;
            }

            this.listTableData = res.data;
          })
          .finally(() => {
            this.listTableLoading = false;
          });
      }
    },
    // 人员选择完成
    personnelConfirm(arr) {
      if (!arr || !arr.length) {
        return;
      }

      this.currentUser = arr[0];
      this.listQuery.identityNo = arr.map(item => item.identityNo).join(",");
      this.$nextTick(() => {
        this.onSubmit();
      });
    },
    onListPaging(val) {
      this.listQuery.offset = val;
      this.onSubmit();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.onSubmit();
    },
    // 查看大图
    onLookPicture(img) {
      this.rowBgImg = img;
      this.isBgDialog = true;
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@/styles/trajectory.scss";
</style>