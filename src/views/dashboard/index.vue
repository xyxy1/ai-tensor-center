<template>
  <div class="dashboard-container">
    <!-- 统计 S -->
    <el-row :gutter="10" class="head" v-if="statisticsData">
      <el-col :md="6" :span="12">
        <div class="statistics s1">
          <div class="box">
            <div class="title">人脸识别摄像头</div>
            <b>{{statisticsData.cameraTotal}}</b>
          </div>
          <div class="more">
            <div class="item">
              <i class="el-icon-success"></i>在线：{{statisticsData.cameraOnline}}
            </div>
            <div class="item">
              <i class="el-icon-warning"></i>离线：{{statisticsData.cameraOffline}}
            </div>
          </div>
        </div>
      </el-col>
      <el-col :md="6" :span="12">
        <div class="statistics s2">
          <div class="box">
            <div class="title">今日总人数</div>
            <b>{{statisticsData.labelTotal}}</b>
          </div>
          <div class="more">
            <div class="item">
              <em>业主</em>{{statisticsData.ownerTotal}}
            </div>
            <div class="item">
              <em>陌生人</em>{{statisticsData.strangerTotal}}
            </div>
            <div class="item">
              <em>黑名单</em>{{statisticsData.blackTotal}}
            </div>
          </div>
        </div>
      </el-col>
      <el-col :md="6" :span="12">
        <div class="statistics s3">
          <div class="box">
            <div class="title">今日人脸采集总数</div>
            <b>{{statisticsData.snapTotal}}</b>
          </div>
          <router-link to="/dataCenter/historicalRecord" class="more">
            <i class="el-icon-search"></i>查看历史抓拍记录
          </router-link>
        </div>
      </el-col>
      <el-col :md="6" :span="12">
        <div class="statistics s4">
          <div class="box">
            <div class="title">今日预警</div>
            <b>{{statisticsData.warnTotal}}</b>
          </div>
          <router-link to="/myControl/alarmNews" class="more">
            有<span>{{statisticsData.warnTodoTotal}}</span>条新告警信息，请注意查看！
          </router-link>
        </div>
      </el-col>
    </el-row>
    <!-- 统计 E -->

    <el-row class="main">
      <el-col :md="18" :span="24">
        <div class="camera-show">
          <!-- 标题 -->
          <div class="title">
            摄像头分布
            <el-button-group class="btns">
              <el-button :type="camera.mode===0?'primary':''" @click="camera.mode=0" size="mini">今日</el-button>
              <el-button :type="camera.mode===1?'primary':''" @click="camera.mode=1" size="mini">本周</el-button>
              <el-button :type="camera.mode===2?'primary':''" @click="camera.mode=2" size="mini">本月</el-button>
            </el-button-group>
          </div>

          <!-- 地图 -->
          <div class="box">
            <div id="map" class="map"></div>
            <line-chart class="line-chart" height="110px" :data="[chartData.statisData[camera.mode].persons,chartData.statisData[camera.mode].alarm]" v-if="chartData" />
          </div>
        </div>
      </el-col>
      <el-col :md="6" :span="24">
        <div class="info-show" v-if="communityData">
          <div class="box">
            <div class="title">{{communityData.name}}</div>
            <div class="place">
              <svg-icon icon-class="locale" />{{communityData.address}}
            </div>
            <div class="pic">
              <img :src="communityData.realMapUrl">
            </div>
          </div>
          <div class="proprietor">
            ● 已采集业主
            <div class="number">
              <span>{{communityData.ownerCnt}}</span>人</div>
          </div>
          <div class="chart-box">
            <pie-chart class="pie-chart" :data="communityData.labelStatisVOS"></pie-chart>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { getCommunity, getStatistics, getChartData } from "@/api/dashboard";

export default {
  name: "dashboard",
  data: () => ({
    aMap: null,
    camera: {
      mode: 0,
      lineChartData: []
    },
    imgList: [
      require("@/assets/camera/icon1.png"),
      require("@/assets/camera/icon2.png")
    ],
    communityData: null,
    statisticsData: null,
    chartData: null
  }),
  watch: {
    "camera.mode"() {
      this.addMarker();
    }
  },
  async mounted() {
    await this.initData();
    this.initMap();
  },
  activated() {
    if (this.aMap) {
      this.addMarker();
      this.initData();
    }
  },
  components: {
    "pie-chart": () => import("./components/PieChart"),
    "line-chart": () => import("./components/LineChart")
  },
  methods: {
    async initData() {
      await getCommunity().then(res => {
        if (res.status == 200) {
          this.communityData = res.data;
        }
      });
      await getStatistics().then(res => {
        if (res.status == 200) {
          this.statisticsData = res.data;
        }
      });
      await getChartData().then(res => {
        if (res.status == 200) {
          this.chartData = res.data;
        }
      });
    },
    initMap() {
      // 高德地图调用开始
      this.aMap = new AMap.Map("map", {
        resizeEnable: true,
        animateEnable: false
      });

      new AMap.Polygon({
        map: this.aMap,
        path: this.chartData.communityRange,
        bubble: true,
        strokeColor: "#0fa0ff",
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: "#0fa0ff",
        fillOpacity: 0.3
      });

      // 重新定位中心点
      this.aMap.setFitView();

      // 添加摄像头
      this.addMarker();
    },
    addMarker() {
      if (this.aMap) {
        this.aMap.remove(this.aMap.getAllOverlays("marker"));
        // 循环摄像头
        this.chartData.statisData[this.camera.mode].camera.map(item => {
          if (!item.lng && !item.lat) {
            return;
          }

          let _point = [item.lng, item.lat];
          // 添加遮罩点
          new AMap.Marker({
            //添加自定义点标记
            map: this.aMap,
            position: _point, //基点位置
            offset: new AMap.Pixel(-12, -36), //相对于基点的偏移位置
            icon: new AMap.Icon({
              size: new AMap.Size(24, 36), //图标大小
              image: this.imgList[item.cnt > 0 ? 0 : 1],
              imageOffset: new AMap.Pixel(0, 0)
            }),
            draggable: false //是否可拖动
          });

          if (item.cnt > 0) {
            // 添加预警点
            new AMap.Marker({
              //添加自定义点标记
              map: this.aMap,
              position: _point, //基点位置
              offset: new AMap.Pixel(4, -43), //相对于基点的偏移位置
              draggable: false, //是否可拖动
              content: `<div class='custom-marker-alarm'>${item.cnt}</div>` //自定义点标记覆盖物内容
            });
          }
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@/styles/dashboard.scss";
</style>