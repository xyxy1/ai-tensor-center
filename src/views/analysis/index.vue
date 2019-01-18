<template>
  <div class="analysis-main">
    <!-- 头部模块 S -->
    <div class="header" ref="header">
      <router-link to="/" class="url">{{title}}</router-link>
      <div class="time">{{currentDate}}</div>
    </div>

    <div class="footer"></div>

    <div class="full-screen" @click="screenfull.toggle()"></div>

    <!-- 左侧图表展示 S -->
    <div class="left-show">
      <div class="left-chart">
        <div class="title" @click="test(1)">人员类型分布</div>
        <pie-chart :data="pieChartData" />
      </div>
      <hr />
      <div class="left-chart">
        <div class="title" @click="test(0)">近一周采集统计</div>
        <line-chart :data="lineChartData" />
      </div>
      <hr />
      <div class="left-chart">
        <div class="title" @click="test(2)">近一周预警记录</div>
        <bar-chart :data="barChartData" />
      </div>
    </div>
    <!-- 左侧图表展示 E -->

    <!-- 右侧数据展示 S -->
    <div class="right-show">
      <div class="box" ref="rightShow">
        <!-- 黑名单模板 S -->
        <transition name="blacklist">
          <div class="blacklist" :class="{'elastic': blacklistUpdate}" v-if="blacklist" :ket="blacklist.keyTime">
            <div class="tip">黑名单预警</div>
            <div class="comparison">
              <div class="pic"><img :src="blacklist.faceImage">
                <div class="mask">抓拍图片</div>
              </div>
              <cirque-chart width="110px" :data="blacklist.similarity" />
              <div class="pic"><img :src="blacklist.labelImageUrl?blacklist.labelImageUrl:blacklist.labelImage">
                <div class="mask">底库照片</div>
              </div>
            </div>
            <div class="info">
              <ul>
                <li class="ellipsis name">
                  <span>姓　　名：</span>{{blacklist.labelName}}
                  <em>{{blacklist.labelTypeName}}</em>
                </li>
                <!-- <li>
                  <span>年　　龄：</span>40岁
                </li>
                <li>
                  <span>性　　别：</span>女
                </li> -->
                <li class="w100">
                  <span>身份证号：</span>{{blacklist.labelNo}}
                </li>
                <li class="ellipsis w100">
                  <span>抓拍地址：</span>{{blacklist.cameraName}}
                </li>
                <li class="ellipsis w100">
                  <span>抓拍时间：</span>{{moment(blacklist.imageTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')}}
                </li>
              </ul>
            </div>
          </div>
        </transition>
        <!-- 黑名单模板 E -->

        <!-- 尾随模板 S -->
        <transition name="follow">
          <div class="follow" :class="{'elastic': followUpdate}" v-if="follow" :ket="follow.keyTime">
            <div class="tip">尾随预警</div>
            <div class="info">
              <div class="portrait"><img :src="follow.labelImageUrl?follow.labelImageUrl:follow.labelImage">
                <div class="mask">底库图片</div>
              </div>
              <ul>
                <li class="ellipsis name">
                  <span>姓　名：</span>{{follow.labelName}}
                  <em>尾随</em>
                </li>
                <!-- <li>
                  <span>年　龄：</span>40岁
                </li>
                <li>
                  <span>性别：</span>女
                </li> -->
                <li class="w100">
                  <span>相似度：</span>{{follow.similarity}}%
                </li>
                <li class="ellipsis w100">
                  <span>地　址：</span>{{follow.cameraName}}
                </li>
                <li class="w100">
                  <span>时　间：</span>{{moment(follow.imageTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')}}
                </li>
              </ul>
            </div>

            <div class="img-list">
              <p>被尾随业主：{{follow.nameLabelList.length}}</p>
              <!-- swiper -->
              <swiper ref="swiper" :options="swiperOption">
                <swiper-slide v-for="(item,index) in follow.nameLabelList" :key="index">
                  <div class="pic" :class="{p1:!follow.isWarn && item.labelNums.indexOf('1') < 0, p2:follow.isWarn}">
                    <div class="top-label">
                      <!-- <span>{{item.labelNames.split(',').map(val => val.substr(0, 1)).join('\\')}}</span> -->
                      <span>业</span>
                    </div>
                    <img :src="item.identityImg">
                    <div class="mask">{{item.name}}</div>
                  </div>
                </swiper-slide>
              </swiper>
              <div class="swiper-button-prev"></div>
              <div class="swiper-button-next"></div>
            </div>
          </div>
        </transition>
        <!-- 尾随模板 E -->

        <!-- 通用模板 S -->
        <transition-group tag="div" class="ov-hi" name="list-drop">
          <div class="normal" :class="{'elastic': item.elastic}" @animationend="animationEnd(item)" v-for="item in analysisList" :key="item.labelNo">
            <div class="info">
              <div class="pic"><img :src="item.labelImageUrl?item.labelImageUrl:item.labelImage">
                <div class="mask">底库图片</div>
              </div>
              <ul>
                <li class="w100 name">
                  <span>人员类型：</span>
                  <label class="ellipsis">{{item.labelName}}</label>
                  <em v-if="item.labelTypeName">{{item.labelTypeName.split(',').map(val => val.substr(0, 1)).join('\\')}}</em>
                </li>
                <!-- <li>
                  <span>年　龄：</span>40岁
                </li>
                <li>
                  <span>性别：</span>女
                </li> -->
                <li class="w100 ellipsis" v-if="testShow == 3">
                  <span>证件号：</span>{{item.labelNo}}
                </li>
                <li class="w100 ellipsis">
                  <span>相似度：</span>{{item.similarity}}%
                </li>
                <li class="w100 ellipsis">
                  <span>抓拍地址：</span>{{item.cameraName}}
                </li>
                <li class="w100">
                  <span>抓拍时间：</span>{{moment(item.imageTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')}}
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

    <!-- 地图区域 E -->
    <div class="map-region">
      <div class="map" id="map"></div>
      <div class="satellite-switch" @click="onSatelliteSwitch" :class="{on:isSatelliteMap}">卫星</div>
      <div class="map-camera" v-for="cameraItem in initCameraData" :key="'mapCamera'+cameraItem.id" :id="'mapCamera'+cameraItem.id" :class="{'warn':cameraTypeList[cameraItem.id]}">
        <el-tooltip placement="bottom" :open-delay="200" v-if="cameraItem.lng && cameraItem.lat">
          <div class="icon"></div>
          <div slot="content">
            {{cameraItem.cameraName}}
          </div>
        </el-tooltip>
      </div>
      <div class="map-camera-layer" v-for="cameraItem in initCameraData" :key="'mapCameraLayer'+cameraItem.id" :id="'mapCameraLayer'+cameraItem.id">
        <transition-group tag="ul" name="list-rise" v-if="cameraItem.lng && cameraItem.lat">
          <li :class="{'warn-item': item.isWarn, 'vanish': (cameraList[cameraItem.id].length>1 && index!==cameraList[cameraItem.id].length-1), 'hide': (cameraList[cameraItem.id].length>2 && index+2<cameraList[cameraItem.id].length)}" v-for="(item,index) in cameraList[cameraItem.id]" :key="item.id">
            <img :src="item.url" class="pic">
            <div class="t1">抓拍时间</div>
            <div class="t2">{{moment(item.imageTime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm:ss')}}</div>
          </li>
        </transition-group>
      </div>
    </div>
    <!-- 地图区域 E -->

    <!-- 实时抓拍 S -->
    <div class="real-time-snapshot">
      <div class="title">实时人脸抓拍</div>
      <div class="list">
        <div class="tip" v-if="!imgList.length">暂无数据</div>
        <transition-group name="list" class="box" tag="div">
          <el-tooltip placement="top" :open-delay="200" v-for="item in imgList" :key="item.id" effect="light">
            <div :class="{warn:item.isWarn}" class="pic">
              <div class="top-label" v-if="item.isWarn || testShow == 3">
                <span v-if="testShow == 3 && item.labelName">{{item.labelName}}</span>
                <span v-else>黑</span>
              </div>
              <img :src="item.url">
              <div class="mask">{{item.cameraName}}</div>
            </div>
            <div slot="content">
              {{item.cameraName}}
            </div>
          </el-tooltip>
        </transition-group>
      </div>
    </div>
    <!-- 实时抓拍 E -->

    <!-- 总数统计 S -->
    <div class="statistics" ref="statistics">
      <div class="item i1">
        <div class="title">今日采集总人数</div>
        <iCountUp class="txt" ref="statisticsCount1" :startVal="0" :endVal="statistics.labelTotal" :decimals="0" :duration="2" :options="countUpOptions" />
      </div>
      <div class="item i2">
        <div class="title">今日人脸采集</div>
        <iCountUp class="txt" ref="statisticsCount2" :startVal="0" :endVal="statistics.snapTotal" :decimals="0" :duration="2" :options="countUpOptions" />
      </div>
      <div class="item i3">
        <div class="title">今日预警次数<span @click="onOpenLayer()">详情</span></div>
        <iCountUp class="txt" ref="statisticsCount3" :startVal="0" :endVal="statistics.warnTotal" :decimals="0" :duration="2" :options="countUpOptions" />
      </div>
    </div>
    <!-- 总数统计 E -->

    <!-- 黑名单列表 S -->
    <div class="blacklist-layer" :class="{show: blacklistLayerShow, hide: !blacklistLayerShow}" v-if="isInit">
      <div class="mask" @click="blacklistLayerShow = false"></div>
      <div class="box">
        <div class="title">
          <i class="el-icon-d-arrow-right"></i>黑名单预警
          <div class="total">
            <span>{{moreBlacklist.length}}</span>人
          </div>
        </div>
        <transition-group name="blacklist" class="list" tag="div">
          <div class="item" :class="{'elastic': item.elastic}" @animationend="animationEnd(item)" v-for="item in moreBlacklist" :key="item.labelNo">
            <div class="comparison">
              <div class="pic"><img :src="item.faceImage">
                <div class="mask">抓拍图片</div>
              </div>
              <cirque-chart width="100px" :data="item.similarity" />
              <div class="pic"><img :src="item.labelImageUrl?item.labelImageUrl:item.labelImage">
                <div class="mask">底库照片</div>
              </div>
            </div>
            <div class="info">
              <ul>
                <li class="w100">
                  <span>姓　　名：{{item.labelName}}</span>
                  <em>【{{item.labelTypeName}}】</em>
                </li>
                <li class="w100">
                  <span>身份证号：</span>{{item.labelNo}}
                </li>
                <li class="w100">
                  <span>地点：{{item.cameraName}}</span>
                </li>
                <li class="w100">时间：{{moment(item.imageTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')}}</li>
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

import { getCameraList } from "@/api/bigData/camera/index";
import { getAnalysisHistoryList } from "@/api/analysis";
import { getCommunity } from "@/api/bigData/community";

import "swiper/dist/css/swiper.css";
import { swiper, swiperSlide } from "vue-awesome-swiper";

export default {
  name: "analysis",
  data() {
    return {
      title: "人脸大数据系统",
      testShow: 0,
      currentDate: moment().format("YYYY-MM-DD HH:mm:ss"),
      timer: null,

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
      followUpdate: false,
      blacklistUpdate: false,
      statistics: {
        labelTotal: 0,
        snapTotal: 0,
        warnTotal: 0
      },
      initCameraData: [],
      swiperList: [],

      countUpOptions: {
        useEasing: true,
        useGrouping: true,
        separator: ",",
        decimal: "."
      },
      swiperOption: {
        slidesPerView: 5,
        spaceBetween: 4,
        freeMode: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev"
        }
      },

      pieChartData: [],
      lineChartData: [],
      barChartData: []
    };
  },
  computed: {
    ...mapState({
      imgList: state => state.analysis.imgList, // 图片列表
      cameraList: state => state.analysis.cameraList, // 摄像头数据
      cameraTypeList: state => state.analysis.cameraTypeList, // 摄像头状态
      follow: state => state.analysis.follow, // 尾随
      blacklist: state => state.analysis.blacklist, // 黑名单
      moreBlacklist: state => state.analysis.moreBlacklist, // 黑名单列表
      analysisList: state => state.analysis.analysisList // 分析数据
    })
  },
  watch: {
    "blacklist.keyTime": function() {
      this.blacklistUpdate = false;
      this.$nextTick(() => {
        this.blacklistUpdate = true;
      });
    },
    "follow.keyTime": function() {
      this.followUpdate = false;
      this.$nextTick(() => {
        this.followUpdate = true;
      });
    },
    swiperList(val) {
      this.$nextTick(() => {
        this.$refs.swiper.swiper.slideTo(val.length, 1000, false);
      });
    },
    statistics: {
      handler: function(val, oldVal) {
        this.$nextTick(() => {
          this.$refs.statisticsCount1.update(val.labelTotal);
          this.$refs.statisticsCount2.update(val.snapTotal);
          this.$refs.statisticsCount3.update(val.warnTotal);
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
    this.dateTimer();
    this.initMap();

    this.rightZoom();
    this.headerZoom();
    this.resizeHanlder = debounce(() => {
      this.rightZoom();
      this.headerZoom();
    }, 100);
    window.addEventListener("resize", this.resizeHanlder);
  },
  beforeDestroy() {
    this.isDestroy = true;

    this.timer && clearTimeout(this.timer);
    this.webSocket && this.webSocket.close();
  },
  components: {
    iCountUp,
    swiper,
    swiperSlide,
    "pie-chart": () => import("./components/PieChart"),
    "line-chart": () => import("./components/LineChart"),
    "bar-chart": () => import("./components/BarChart"),
    "cirque-chart": () => import("./components/CirqueChart")
  },
  methods: {
    test(val) {
      if (this.testShow == val) {
        this.testShow++;
      } else {
        this.testShow = 0;
      }
    },
    initTitle() {
      getCommunity().then(res => {
        if (res.status == 200) {
          this.title = res.data.faceViewTitle;
        }
      });
    },
    // 卫星切换
    onSatelliteSwitch() {
      this.satelliteLayer.setMap(this.isSatelliteMap ? null : this.aMap);
      this.isSatelliteMap = !this.isSatelliteMap;
    },
    animationEnd(item) {
      item.elastic = false;
    },
    onOpenLayer() {
      this.isInit = true;
      this.blacklistLayerShow = true;
    },
    dateTimer() {
      this.timer = setTimeout(() => {
        this.currentDate = moment().format("YYYY-MM-DD HH:mm:ss");
        this.dateTimer();
      }, 1000);
    },
    // 头部缩放
    headerZoom() {
      let _zoom = this.$el.clientWidth / 1920;
      this.$refs.header.style.transform = `scale(${_zoom})`;
    },
    // 右侧缩放控制
    rightZoom() {
      let _zoom = (this.$el.clientWidth * 0.203125) / 390;
      this.$refs.rightShow.style.transform = `scale(${_zoom})`;
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
        offset: new AMap.Pixel(-12, -36), //相对于基点的偏移位置
        draggable: false, //是否可拖动
        content: _camera, //自定义点标记覆盖物内容
        draggable: false //是否可拖动
      });
      // 自定义遮罩弹窗
      new AMap.Marker({
        //添加自定义点标记
        map: this.aMap,
        position: _point, //基点位置
        offset: new AMap.Pixel(0, -40), //相对于基点的偏移位置
        draggable: false, //是否可拖动
        content: _cameraLayer, //自定义点标记覆盖物内容
        zIndex: 999,
        draggable: false //是否可拖动
      });
    },
    initMap() {
      // 高德地图调用开始
      this.aMap = new AMap.Map("map", {
        resizeEnable: true,
        animateEnable: false
      });

      getCameraList({
        offset: 1,
        limit: 999999
      }).then(res => {
        let _data = res.data.rows;
        this.initCameraData = _data;

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
        this.$store.dispatch("analysis/setCamera", _idArr).then(() => {
          getAnalysisHistoryList()
            .then(res => {
              if (res.status == 200) {
                this.$store.dispatch(
                  "analysis/saveBlacklist",
                  res.data.blackList.reverse()
                );
                this.$store.dispatch(
                  "analysis/init",
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
    initWebSocket() {
      this.webSocket = new WebSocket(
        `ws://${this.ip}/websocket/push/${getToken()}`
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
            this.$store.dispatch("analysis/push", JSON.parse(_data.message));
          }
          if (typeof _data === "object" && _data.code == 3) {
            let _json = JSON.parse(_data.message);
            this.statistics = _json.snapInfo; // 统计更新
            this.pieChartData = _json.dayLabel; // 人员类型分布更新
            this.lineChartData = _json.daySnap; // 近一周流量统计更新
            this.barChartData = _json.dayBlack; // 近一周报警记录更新
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
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@/styles/analysis.scss";
</style>
