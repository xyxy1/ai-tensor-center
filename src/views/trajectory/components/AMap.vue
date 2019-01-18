<template>
  <div class="map-main">
    <!-- 地图 -->
    <div id="map" class="map"></div>

    <!-- 地图弹窗 -->
    <div class="map-layer" ref="mapLayer">
      <template v-if="listData[map.markerIndex]">
        <img-show class="head" width="70px" height="70px" base64 :img-src="listData[map.markerIndex].snapImg" />
        <span>{{moment(listData[map.markerIndex].imgTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')}}</span>
        <p>{{moment(listData[map.markerIndex].imgTime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm:ss')}}</p>
      </template>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import lmyMapTrajectory from "@/utils/lmyMapTrajectory.js";
import { getTrajectoryDetails } from "@/api/trajectory";

export default {
  name: "a-map",
  props: {
    play: {
      required: true,
      type: Boolean
    },
    listQuery: Object,
    currentUser: Object,
    listData: {
      required: true,
      type: [Array]
    },
    index: {
      required: true,
      type: [Number]
    }
  },
  data() {
    return {
      moment: moment,
      map: {
        markerIndex: null,
        pointList: [], // 点坐标数组
        markerList: [], // 点图标数组
        imgList: [
          require("@/assets/trajectory/icon-maker-img1.png"),
          require("@/assets/trajectory/icon-maker-img2.png")
        ]
      },
      aMap: null,
      isInit: true,
      isPlay: false,
      canvasTrajectory: null
    };
  },
  watch: {
    play(val) {
      this.isPlay = val;
    },
    isPlay(val) {
      this.$emit("update:play", val);
    },
    listData() {
      this.isInit = true;
      // 判断是否首次加载
      if (this.aMap.indoorMap) {
        this.updateMap();
      } else {
        // 地图加载完成后
        this.aMap.on("complete", () => {
          this.updateMap();
        });
      }
    },
    index() {
      if (this.isInit) {
        this.isInit = false;
        return;
      }
      this.updatePoint();
    }
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      // 高德地图调用开始
      this.aMap = new AMap.Map("map", {
        resizeEnable: true,
        animateEnable: false
      });
      // 设置配色
      // this.aMap.setMapStyle("amap://styles/dark");

      // 地图开始缩放事件
      this.aMap.on("zoomstart", () => {
        if (this.markerLayer) {
          // 关闭弹出层
          this.markerLayer.hide();
          // 关闭智能匹配
          this.$nextTick(() => {
            this.emptyMarKerTop();
            if (this.map.markerIndex != null) {
              this.map.markerList[this.map.markerIndex].setTop(false);
            }
          });
        }
      });

      // 地图开始移动事件
      this.aMap.on("dragstart", () => {
        this.isPlay = false;
        if (this.markerLayer) {
          // 关闭弹出层
          this.markerLayer.hide();
          // 关闭智能匹配
          this.$nextTick(() => {
            this.emptyMarKerTop();
            if (this.map.markerIndex != null) {
              this.map.markerList[this.map.markerIndex].setTop(false);
            }
          });
        }
      });

      // 地图加载完成后
      this.aMap.on("complete", () => {
        this.canvasTrajectory = new lmyMapTrajectory();
        let mapCustomLayer = new AMap.CustomLayer(
          this.canvasTrajectory.canvas,
          {
            map: this.aMap,
            zIndex: 10,
            zooms: [3, 18] // 设置可见级别，[最小级别，最大级别]
          }
        );
        mapCustomLayer.render = () => {
          this.drawTrajectory(
            this.index > this.map.pointList.length - 1
              ? this.map.pointList.length - 1
              : this.index
          );
        };
      });
    },
    updateMap() {
      this.aMap.clearMap();
      // 清空处理
      this.markerLayer = null;
      this.map.pointList = [];
      this.map.markerList = [];
      this.map.markerIndex = null;
      this.emptyMarKerTop();
      // 循环用户轨迹
      this.listData.forEach((item, index) => {
        let _point = new AMap.LngLat(item.lng, item.lat);
        _point.id = item.id;

        // 添加点
        this.map.pointList.push(_point);
        this.map.markerList.push(this.addMarker(_point, index, item.id));
      });
      // 重新定位中心点
      this.aMap.setFitView();
      this.aMap.setZoom(this.aMap.getZoom() - 1);
    },
    updatePoint() {
      // 清空相邻数组
      this.emptyMarKerTop();
      // 关闭弹出层
      this.markerLayer && this.markerLayer.hide();
      // 更新轨迹
      this.drawTrajectory(
        this.index > this.map.pointList.length - 1
          ? this.map.pointList.length - 1
          : this.index
      );
      // 显示隐藏对应点
      this.map.markerList.forEach(item => {
        if (item.index <= this.index) {
          item.show();
        } else {
          item.hide();
        }
      });
    },
    /**
     * 添加轨迹点
     * @param {Point} [point] - 坐标点
     * @param {String} [index] - 标识
     * @param {Number} [id] - id
     * @retrun {Marker} 返回高德生成的遮罩点
     */
    addMarker(point, index, id) {
      let _this = this;

      // 添加遮罩点
      var _marker = new AMap.Marker({
        //添加自定义点标记
        map: _this.aMap,
        position: point, //基点位置
        offset: new AMap.Pixel(-15, -43), //相对于基点的偏移位置
        draggable: false, //是否可拖动
        content:
          "<div class='custom-marker-icon'><img src='" +
          this.map.imgList[1] +
          "' />" +
          (index + 1) +
          "</div>" //自定义点标记覆盖物内容
      });
      _marker.id = id;
      _marker.index = index;
      _marker.setzIndex(99);
      // 轨迹点击处理
      _marker.on("click", function(ev) {
        _this.onClickMarker({
          lng: this.getPosition().lng,
          lat: this.getPosition().lat,
          index: this.index
        });
      });

      return _marker;
    },
    addMarkerLayer(point) {
      var _layer = this.$refs.mapLayer.cloneNode(true);
      _layer.style.top = 0;
      _layer.style.left = 0;

      // 判断弹窗是否存在
      if (this.markerLayer) {
        // 存在改变弹窗位置
        this.markerLayer.setPosition(point);
        this.markerLayer.setContent(_layer);
        this.markerLayer.show();
      } else {
        // 自定义遮罩弹窗
        this.markerLayer = new AMap.Marker({
          //添加自定义点标记
          map: this.aMap,
          position: point, //基点位置
          offset: new AMap.Pixel(
            -this.$refs.mapLayer.offsetWidth / 2,
            -this.$refs.mapLayer.offsetHeight - 50
          ), //相对于基点的偏移位置
          draggable: false, //是否可拖动
          content: _layer //自定义点标记覆盖物内容
        });
        this.markerLayer.setzIndex(999);
      }
    },
    // 清空轨迹置顶
    emptyMarKerTop() {
      if (this.map.markerIndex != null) {
        this.map.markerList[this.map.markerIndex].setTop(false);
      }
    },
    // 点击轨迹获取详情
    onClickMarker(item) {
      // 标记置顶处理
      if (this.map.markerIndex != null) {
        if (this.map.markerIndex > this.index) {
          this.map.markerList[this.map.markerIndex].hide();
        }
        this.map.markerList[this.map.markerIndex].setTop(false);
        this.map.markerList[this.map.markerIndex].setContent(
          "<div class='custom-marker-icon'><img src='" +
            this.map.imgList[1] +
            "' />" +
            (this.map.markerIndex + 1) +
            "</div>"
        );
      }
      this.map.markerList[item.index].show();
      this.map.markerList[item.index].setTop(true);
      this.map.markerList[item.index].setContent(
        "<div class='custom-marker-icon'><img src='" +
          this.map.imgList[0] +
          "' />" +
          (item.index + 1) +
          "</div>"
      );

      // 判断是否重复点击
      if (this.map.markerIndex === item.index) {
        this.markerLayer && this.markerLayer.show();
        return;
      }
      this.map.markerIndex = item.index;

      // 获取详情
      this.aMap.setCenter(new AMap.LngLat(item.lng, item.lat));
      // this.aMap.panBy(0, 100);

      this.$nextTick(() => {
        this.addMarkerLayer(new AMap.LngLat(item.lng, item.lat));
      });
    },
    // 绘制轨迹
    drawTrajectory(index) {
      this.canvasTrajectory.empty();
      if (index < 1) {
        return;
      }

      if (this.map.pointList.length > 1) {
        let _data = this.map.pointList.map(item =>
          this.aMap.lngLatToContainer(item)
        );
        let end = index || _data.length - 1;
        let animateStart = index ? index - 1 : _data.length - 1;

        this.canvasTrajectory.initData(
          Object.assign(this.aMap.getSize(), {
            pathList: _data
          }),
          0,
          end,
          this.isPlay ? animateStart : end
        );
      }
    }
  }
};
</script>