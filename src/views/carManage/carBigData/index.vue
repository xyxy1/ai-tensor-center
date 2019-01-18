<template>
  <div class="carBigData-main">
    <!-- 头部模块 S -->
    <div class="header" ref="header">
      <router-link to="/" class="url">{{title}}</router-link>
      <div class="time">
        <div class="tit">{{currentYTD}}</div>
        <flip-timer type="date"></flip-timer>
      </div>
    </div>

    <!-- 左侧统计展示 -->
    <div class="left-show">
      <div class="left-box">
        <div class="title">今日车流量</div>
        <div class="box b1">
          <iCountUp ref="statisticsTodayCars" :startVal="0" :endVal="todayCars" :decimals="0" :duration="2" :options="countUpOptions" />
        </div>
      </div>
      <hr />
      <div class="left-box mt">
        <div class="title">今日预警次数<span @click="onOpenLayer">布控预警</span></div>
        <div class="box b2">
          <iCountUp ref="statisticsTodayWarns" :startVal="0" :endVal="todayWarns" :decimals="0" :duration="2" :options="countUpOptions" />
        </div>
      </div>
      <hr />
      <div class="left-chart line-chart">
        <div class="title">近一周车流量统计</div>
        <line-chart :data="lineChartData" />
      </div>
      <hr />
      <div class="left-chart bar-chart">
        <div class="title">近一周预警记录</div>
        <bar-chart :data="barChartData" />
      </div>
    </div>

    <!-- 右侧数据展示 S -->
    <div class="right-show">
      <div class="box" ref="rightShow">
        <!-- 通用模板 S -->
        <transition-group tag="div" class="ov-hi" name="list-drop">
          <div class="normal" :class="{'warn': item.inControll, 'elastic': item.elastic}" @animationend="animationEnd(item)" v-for="item in analysisList" :key="item.plateNo">
            <div class="tip">布控预警</div>
            <div class="info">
              <div class="pic">
                <img :src="item.passImage">
                <div class="mask">抓拍图片</div>
              </div>
              <ul>
                <li>
                  <span>车牌号：</span>{{item.plateNo}}
                </li>
                <li>
                  <span>车　场：</span>{{item.parkInfoName}}
                </li>
                <li>
                  <span>地　址：</span>{{item.passPlace}}
                </li>
                <li>
                  <span>时　间：</span>{{moment(item.passTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')}}
                </li>
              </ul>
            </div>
          </div>
        </transition-group>
        <!-- 通用模板 E -->

        <!-- 空数据模板 S -->
        <div class="null" v-for="index in 20" :key="index">
          暂无数据
        </div>
        <!-- 空数据模板 E -->
      </div>
    </div>
    <!-- 右侧数据展示 E -->

    <!-- 地图区域 -->
    <div class="map-region">
      <div id="map" class="map"></div>
      <div class="satellite-switch" @click="onSatelliteSwitch" :class="{on:isSatelliteMap}">卫星</div>
      <div class="map-camera" v-if="cameraItem.lng && cameraItem.lat" v-for="cameraItem in initParkingLotData" :key="'mapCamera'+cameraItem.id" :id="'mapCamera'+cameraItem.id" :class="{'warn':cameraTypeList[cameraItem.id]}">
        <el-tooltip placement="bottom" :open-delay="200">
          <div class="icon"></div>
          <div slot="content">
            {{cameraItem.name}}
          </div>
        </el-tooltip>
      </div>
      <div class="map-camera-layer" v-if="cameraItem.lng && cameraItem.lat" v-for="cameraItem in initParkingLotData" :key="'mapCameraLayer'+cameraItem.id" :id="'mapCameraLayer'+cameraItem.id">
        <transition-group tag="ul" name="list-rise">
          {{cameraList[cameraItem.id].length}}
          <li :class="{'warn-item': item.inControll, 'vanish': (cameraList[cameraItem.id].length>1 && index!==cameraList[cameraItem.id].length-1), 'hide': (cameraList[cameraItem.id].length>2 && index+2<cameraList[cameraItem.id].length)}" v-for="(item,index) in cameraList[cameraItem.id]" :key="item.id">
            <img :src="item.url" class="pic">
            <div class="t1">{{moment(item.imageTime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm:ss')}}</div>
            <div class="t2">{{item.plateNo}}</div>
          </li>
        </transition-group>
      </div>
    </div>

    <!-- 实时抓拍 S -->
    <div class="real-time-snapshot">
      <div class="title">实时抓拍</div>
      <div class="list">
        <div class="tip" v-if="!imgList.length">暂无数据</div>
        <transition-group name="list" class="box" tag="div">
          <div v-for="item in imgList" :key="item.id" class="pic" :class="{warn:item.inControll}">
            <div class="top-label" v-if="item.inControll">
              <span>布控</span>
            </div>
            <img :src="item.url">
            <div class="mask">{{item.plateNo}}</div>
          </div>
        </transition-group>
      </div>
    </div>
    <!-- 实时抓拍 E -->

    <!-- 黑名单列表 S -->
    <div class="blacklist-layer" :class="{show: blacklistLayerShow, hide: !blacklistLayerShow}" v-if="isInit">
      <div class="mask" @click="blacklistLayerShow = false"></div>
      <div class="box">
        <div class="title">
          <i class="el-icon-d-arrow-right"></i>布控预警
          <div class="total">
            <span>{{blacklist.length}}</span>/车辆
          </div>
        </div>
        <transition-group name="blacklist" class="list" tag="div">
          <div class="item" :class="{'elastic': item.elastic}" @animationend="animationEnd(item)" v-for="item in blacklist" :key="item.plateNo">
            <div class="tip">布控预警</div>
            <div class="info">
              <div class="pic">
                <img :src="item.passImage">
                <div class="pic-mask">抓拍图片</div>
              </div>
              <ul>
                <li>
                  <span>车牌号：</span>{{item.plateNo}}
                </li>
                <li>
                  <span>车　场：</span>{{item.parkInfoName}}
                </li>
                <li>
                  <span>地　址：</span>{{item.passPlace}}
                </li>
                <li>
                  <span>时　间：</span>{{moment(item.passTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')}}
                </li>
              </ul>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
    <!-- 黑名单列表 E -->
  </div>
</template>
<script>
import moment from "moment";
import { mapState } from "vuex";
import { debounce } from "@/utils";
import { getToken } from "@/utils/auth";

import screenfull from "screenfull";
import iCountUp from "vue-countup-v2";

import { getParkingLotList } from "@/api/carManage/parkingLot";
import { getCarHistroyList } from "@/api/carManage/carBigData";
import { getCommunity } from "@/api/bigData/community";

export default {
  name: "carBigData",
  components: {
    iCountUp,
    "flip-timer": () => import("@/views/realTimeSnapshot/components/FlipTimer"),
    "line-chart": () => import("./components/LineChart"),
    "bar-chart": () => import("./components/BarChart"),
    "cirque-chart": () => import("./components/CirqueChart")
  },
  data() {
    return {
      title: "车辆大数据系统",
      isInit: false,
      blacklistLayerShow: false,

      aMap: null,
      isSatelliteMap: false,
      satelliteLayer: new AMap.TileLayer.Satellite(),

      ip:
        process.env.NODE_ENV === "development" ? process.env.IP : location.host,
      moment: moment,
      screenfull: screenfull,
      isDestroy: false,
      webSocket: null,
      blacklistUpdate: false,
      initParkingLotData: [],

      currentYTD: moment().format("YYYY-MM-DD"),

      countUpOptions: {
        useEasing: true,
        useGrouping: true,
        separator: ",",
        decimal: "."
      },
      todayCars: 0,
      todayWarns: 0,
      lineChartData: [],
      barChartData: [],

      mapImgList: [
        require("@/assets/carBigData/map-icon1.png"),
        require("@/assets/carBigData/map-icon2.png")
      ],
      mapMarkerList: []
    };
  },
  computed: {
    ...mapState({
      imgList: state => state.carBigData.imgList, // 图片列表
      cameraList: state => state.carBigData.cameraList, // 摄像头数据
      cameraTypeList: state => state.carBigData.cameraTypeList, // 摄像头状态
      analysisList: state => state.carBigData.analysisList, // 分析数据
      blacklist: state => state.carBigData.blacklist // 黑名单
    })
  },
  watch: {
    todayCars: {
      handler: function(val) {
        this.$nextTick(() => {
          this.$refs.statisticsTodayCars.update(val);
        });
      },
      immediate: true,
      deep: true
    },
    todayWarns: {
      handler: function(val) {
        this.$nextTick(() => {
          this.$refs.statisticsTodayWarns.update(val);
        });
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    this.initTitle();
  },
  mounted() {
    this.getYTD();
    this.initMap();

    this.headerZoom();
    this.rightZoom();
    this.resizeHanlder = debounce(() => {
      this.headerZoom();
      this.rightZoom();
    }, 50);
    window.addEventListener("resize", this.resizeHanlder);
  },
  beforeDestroy() {
    this.isDestroy = true;

    this.webSocket && this.webSocket.close();
  },
  methods: {
    initTitle() {
      getCommunity().then(res => {
        if (res.status == 200) {
          this.title = res.data.carViewTitle;
        }
      });
    },
    // 卫星切换
    onSatelliteSwitch() {
      this.satelliteLayer.setMap(this.isSatelliteMap ? null : this.aMap);
      this.isSatelliteMap = !this.isSatelliteMap;
    },
    // 头部缩放
    headerZoom() {
      let _zoom = this.$el.clientWidth / 1920;
      this.$refs.header.style.transform = `scale(${_zoom})`;
    },
    onOpenLayer() {
      this.isInit = true;
      this.blacklistLayerShow = true;
    },
    // 区域缩放控制
    regionZoom() {
      let _zoom = Math.min(
        this.$refs.cameraRegion.clientHeight /
          this.$refs.regionShow.clientHeight,
        this.$refs.cameraRegion.clientWidth / this.$refs.regionShow.clientWidth
      );
      this.$refs.regionShow.style.transform = `scale(${_zoom})`;
    },
    // 右侧缩放控制
    rightZoom() {
      let _zoom = (this.$el.clientWidth * 0.203125) / 390;
      this.$refs.rightShow.style.transform = `scale(${_zoom})`;
    },
    animationEnd(item) {
      item.elastic = false;
    },
    initMap() {
      // 高德地图调用开始
      this.aMap = new AMap.Map("map", {
        resizeEnable: true,
        animateEnable: false
      });

      getParkingLotList({
        condition: "",
        offset: 1,
        limit: 9999
      }).then(res => {
        let _data = res.data.rows;
        this.initParkingLotData = _data;

        let _idArr = [];
        _data.map(item => {
          if (item.lng && item.lat) {
            _idArr.push(item.id);

            // 添加点标记
            this.$nextTick(() => {
              this.addMarkerLayer(item);

              // 重新定位中心点
              this.aMap.setFitView();
              this.aMap.setZoom(this.aMap.getZoom() - 1);
            });
          }
        });

        this.$store.dispatch("carBigData/setCamera", _idArr).then(() => {
          getCarHistroyList()
            .then(res => {
              if (res.status == 200) {
                this.$store.dispatch(
                  "carBigData/saveBlacklist",
                  res.data.blackList.reverse()
                );
                this.$store.dispatch(
                  "carBigData/init",
                  res.data.allList.reverse()
                );
              }
            })
            .finally(err => {
              this.initWebSocket();
            });
        });
      });
    },
    addMarkerLayer(data) {
      var _camera = document.getElementById("mapCamera" + data.id);
      var _cameraLayer = document.getElementById("mapCameraLayer" + data.id);
      let _point = [data.lng, data.lat];

      // 自定义点
      new AMap.Marker({
        //添加自定义点标记
        map: this.aMap,
        position: _point, //基点位置
        offset: new AMap.Pixel(-15, -15), //相对于基点的偏移位置
        draggable: false, //是否可拖动
        content: _camera, //自定义点标记覆盖物内容
        draggable: false //是否可拖动
      });
      // 自定义遮罩弹窗
      new AMap.Marker({
        //添加自定义点标记
        map: this.aMap,
        position: _point, //基点位置
        offset: new AMap.Pixel(0, -20), //相对于基点的偏移位置
        draggable: false, //是否可拖动
        content: _cameraLayer, //自定义点标记覆盖物内容
        zIndex: 999,
        draggable: false //是否可拖动
      });
    },
    initWebSocket() {
      this.webSocket = new WebSocket(
        `ws://${this.ip}/carWebsocket/push/${getToken()}`
      );
      //打开事件
      this.webSocket.onopen = () => {
        console.log("webSocket 已打开");
      };
      //获得消息事件
      this.webSocket.onmessage = msg => {
        try {
          let _data = JSON.parse(msg.data);

          if (typeof _data === "object" && _data.code == 0) {
            location.reload();
          }
          if (typeof _data === "object" && _data.code == 2) {
            this.$store.dispatch("carBigData/push", JSON.parse(_data.message));
          }
          if (typeof _data === "object" && _data.code == 3) {
            let _json = JSON.parse(_data.message);
            this.todayCars = _json.todayCars; // 统计更新
            this.todayWarns = _json.todayWarns; // 人员类型分布更新
            this.lineChartData = _json.weekCars; // 近一周流量统计更新
            this.barChartData = _json.weekWarns; // 近一周报警记录更新
          }
        } catch (err) {}
      };
      //关闭事件
      this.webSocket.onclose = () => {
        console.log("Socket已关闭");
        if (!this.isDestroy) {
          this.webSocket = null;
          setTimeout(() => {
            this.initWebSocket();
          }, 1000);
        }
      };
      //发生了错误事件
      this.webSocket.onerror = () => {
        console.log("Socket发生了错误");
      };
    },
    getYTD() {
      setTimeout(() => {
        this.currentYTD = moment().format("YYYY-MM-DD");
        this.getYTD();
      }, 1000);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@/styles/carBigData.scss";
</style>