<template>
  <div class="realTimeSnapshot-main">
    <!-- 头部模块 S -->
    <div class="header" ref="header">
      <!-- logo S -->
      <div class="logo">
        <router-link to="/" class="url"></router-link>
      </div>
      <!-- logo E -->

      <!-- 菜单栏 S -->
      <div class="menu">
        <div class="blacklist-btn" @click="onOpenLayer">
          <span>黑名单（{{blacklist.length}}）</span>
          <i class="el-icon-d-arrow-right"></i>
        </div>
        <div class="time">
          <span @click="test(1)">时间</span>
          <flip-timer type="date"></flip-timer>
        </div>
        <div class="right-box">
          <div class="item">
            <span @click="test(0)">今日访客</span>
            <flip-timer :value="statistics.labelTotal"></flip-timer>
          </div>
          <div class="item">
            <span @click="test(2)">人脸采集</span>
            <flip-timer :value="statistics.snapTotal"></flip-timer>
          </div>
        </div>
      </div>
      <!-- 菜单栏 E -->
    </div>
    <!-- 头部模块 E -->

    <!-- 所有轨迹展示 S -->
    <div class="trail-show">
      <div class="title">
        <div class="t1">基本信息</div>
        <div class="t2">抓拍轨迹</div>
      </div>
      <!-- 个人轨迹 S -->
      <transition-group name="trail-list" class="trail-list" tag="div">
        <div class="trail-item" v-for="analysis in analysisList" :key="analysis.labelNo" :sky="analysis.keyTime">
          <!-- 基本信息 S -->
          <div class="info">
            <img :src="analysis.labelImageUrl?analysis.labelImageUrl:'data:image/jpeg;base64,' + analysis.labelImage">
            <ul>
              <li class="w100">
                <span>姓名：{{analysis.labelName}}</span>
                <div class="labels">
                  <em :class="{'l1': item!=1&&item!=8,'l2': item==1,'l3': item==8}" v-for="(item,index) in analysis.labelTypeCode.split(',')" :key="index">{{analysis.labelTypeName.split(',')[index]}}</em>
                </div>
              </li>
              <li class="w100">相似度：{{analysis.similarity}}%</li>
              <li class="w100" v-if="testShow == 3">证件号：{{analysis.labelNo}}</li>
              <li class="w100">
                <span>地点：{{analysis.cameraName}}</span>
              </li>
              <li class="w100">时间：{{moment(analysis.imageTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')}}</li>
            </ul>
          </div>
          <!-- 基本信息 E -->

          <!-- 个人轨迹列表 S -->
          <transition-group name="list" class="list" tag="div">
            <div class="item" v-for="item in analysis.trailList" :key="item.keyTime" :sky="item.keyTime">
              <img :src="item.imgBgUrl">
              <div class="txt">
                <p>地点：{{item.cameraName}}</p>
                <p>时间：{{moment(item.imageTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')}}</p>
              </div>
            </div>
          </transition-group>
          <!-- 个人轨迹列表 E -->
        </div>
      </transition-group>
      <!-- 所有轨迹展示 E -->
    </div>
    <!-- 轨迹列表 E -->

    <!-- 黑名单列表 S -->
    <div class="blacklist-layer" :class="{show: blacklistLayerShow, hide: !blacklistLayerShow}" v-if="isInit">
      <div class="mask" @click="blacklistLayerShow = false"></div>
      <div class="box">
        <div class="title">
          <i class="el-icon-d-arrow-right"></i>黑名单
          <div class="total">
            <span>{{blacklist.length}}</span>/人
          </div>
        </div>
        <transition-group name="blacklist" class="list" tag="div">
          <div class="item" :class="{'elastic': item.elastic}" @animationend="animationEnd(item)" v-for="item in blacklist" :key="item.labelNo">
            <div class="comparison">
              <div class="pic"><img :src="'data:image/jpeg;base64,' + item.faceImage">
                <div class="mask">抓拍图片</div>
              </div>
              <cirque-chart width="100px" :data="item.similarity" />
              <div class="pic"><img :src="item.labelImageUrl?item.labelImageUrl:'data:image/jpeg;base64,' + item.labelImage">
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

import { query } from "@/api/camera";
import { getHistoryList, getHistoryTrailList } from "@/api/analysis";

export default {
  name: "realTimeSnapshot",
  data: () => ({
    testShow: 0,

    isInit: false,
    moment: moment,

    ip: process.env.NODE_ENV === "development" ? process.env.IP : location.host,
    timer: null,
    webSocket: null,
    isDestroy: false,
    cameraIdList: [],

    statistics: {
      labelTotal: 0,
      snapTotal: 0
    },
    blacklistLayerShow: false
  }),
  computed: {
    ...mapState({
      blacklist: state => state.realTimeSnapshot.blacklist, // 黑名单
      analysisList: state => state.realTimeSnapshot.analysisList, // 轨迹展示列表
      analysisListTotal: state => state.realTimeSnapshot.analysisListTotal // 轨迹展示列表总数
    })
  },
  components: {
    "flip-timer": () => import("./components/FlipTimer"),
    "cirque-chart": () => import("@/views/analysis/components/CirqueChart")
  },
  created() {
    this.initHistory();
  },
  mounted() {
    this.headerZoom();
    this.resizeHanlder = debounce(() => {
      this.headerZoom();
    }, 100);
    window.addEventListener("resize", this.resizeHanlder);
  },
  beforeDestroy() {
    this.isDestroy = true;

    this.timer && clearTimeout(this.timer);
    this.webSocket && this.webSocket.close();
  },
  methods: {
    test(val) {
      if (this.testShow == val) {
        this.testShow++;
      } else {
        this.testShow = 0;
      }
    },
    animationEnd(item) {
      item.elastic = false;
    },
    onOpenLayer() {
      this.isInit = true;
      this.blacklistLayerShow = true;
    },
    // 区域缩放控制
    headerZoom() {
      let _zoom = this.$el.clientWidth / 1920;
      this.$refs.header.style.transform = `scale(${_zoom})`;
    },
    initHistory() {
      if (this.analysisList.length > 0) {
        this.initWebSocket();
        return;
      }

      getHistoryList({
        top: this.analysisListTotal,
        blackFlag: false
      }).then(async res => {
        if (res.status === 200) {
          let _data = res.data.reverse();
          for (let i = 0; i < _data.length; i++) {
            // 获取轨迹列表
            await getHistoryTrailList({
              top: 10,
              identityNo: _data[i].identityNo
            }).then(res1 => {
              if (res1.status === 200) {
                // 初始化人员轨迹
                this.$store.dispatch(
                  "realTimeSnapshot/init",
                  res1.data.reverse()
                );
              }
            });
          }
          this.initWebSocket();
        }
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
            this.$store.dispatch(
              "realTimeSnapshot/push",
              JSON.parse(_data.message)
            );
          }
          if (typeof _data === "object" && _data.code == 3) {
            this.statistics = JSON.parse(_data.message).snapInfo;
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
@import "~@/styles/realTimeSnapshot.scss";
</style>
