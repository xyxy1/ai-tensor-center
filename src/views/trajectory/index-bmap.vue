<template>
  <div class="trajectory-main">
    <!-- 地图 -->
    <div id="map" class="map"></div>
    <!-- 地图弹窗 -->
    <div class="map-layer" ref="mapLayer">
      <i class="close">X</i>
      <div class="title">弹出层标题</div>
      <div class="pic">
        <img src="http://lbsyun.baidu.com/jsdemo/img/tianAnMen.jpg" />
      </div>
      <dl v-if="listData.length>0">
        <dt>【人员姓名】</dt>
        <dd>{{listData[map.markerIndex].name}}</dd>
        <dt>【身份证号】</dt>
        <dd>{{listData[map.markerIndex].identify}}</dd>
        <dt>【抓拍时间】</dt>
        <dd>{{listData[map.markerIndex].time}}</dd>
        <dt>【抓拍地点】</dt>
        <dd>{{listData[map.markerIndex].addr}}</dd>
      </dl>
      <i class="arrow"></i>
    </div>

    <!-- 表单筛选 -->
    <el-form class="form filter-container" @keyup.enter.native="onSubmit">
      <el-button icon="el-icon-plus" class="mr10">选择分析对象</el-button>
      <el-button icon="el-icon-search" class="mr10">以图搜图</el-button>
      轨迹时间：
      <el-date-picker
        v-model="pickerValue"
        type="datetimerange"
        :picker-options="pickerOptions"
        range-separator="|"
        @change="onPickerChange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="center" class="mr10" :clearable="false" :editable="false">
      </el-date-picker>
      轨迹范围：
      <el-select v-model="selectValue" placeholder="轨迹范围" class="mr10">
        <el-option v-for="item in selectOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" @click="onSubmit">开始分析</el-button>
    </el-form>

    <!-- 时间进度 -->
    <time-schedule :startTime="scheduleTime.startTime" :endTime="scheduleTime.endTime" :listData="listData" @change="onScheduleChange"></time-schedule>
  </div>
</template>
<script>
import TimeSchedule from "./components/TimeSchedule";
import { getUsetTrajectory } from "@/api/trajectory";
import moment from "moment";
export default {
  name: "trajectory-index",
  data() {
    return {
      listQuery: {
        startTime: moment()
          .subtract(1, "d")
          .format("YYYY-MM-DD HH:mm:ss"),
        endTime: moment().format("YYYY-MM-DD HH:mm:ss")
      },
      listData: [],
      scheduleTime: {
        startTime: null,
        endTime: null
      },
      map: {
        markerIndex: 0,
        pointList: [], // 点坐标数组
        markerList: [], // 点图标数组
        imgList: [
          require("@/assets/trajectory/icon-maker-img1.png"),
          require("@/assets/trajectory/icon-maker-img2.png")
        ],
        zoom: 17
      },
      bMap: null,
      pickerValue: [moment().subtract(1, "d"), moment()],
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              picker.$emit("pick", [moment().subtract(7, "d"), moment()]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              picker.$emit("pick", [moment().subtract(1, "M"), moment()]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              picker.$emit("pick", [moment().subtract(3, "M"), moment()]);
            }
          }
        ],
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      selectOptions: [
        {
          value: 0,
          label: "厦门市"
        },
        {
          value: 1,
          label: "福州市"
        },
        {
          value: 2,
          label: "泉州市"
        }
      ],
      selectValue: 0
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      // 百度地图API功能
      this.bMap = new BMap.Map("map"); // 创建Map实例
      this.bMap.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放
      this.bMap.centerAndZoom(
        new BMap.Point(116.331398, 39.897445),
        this.map.zoom
      ); // 初始化地图,设置中心点坐标和地图级别
      this.bMap.setMapStyle({ style: "dark" }); // 设置地图配色

      // 地图加载完成后
      let isInit = false;
      this.bMap.addEventListener("tilesloaded", () => {
        if (isInit) return;
        isInit = true;

        // 请求数据
        this.onSubmit();
      });

      // 地图开始移动事件
      this.bMap.addEventListener("movestart", () => {
        // 关闭弹出层
        this.markerLayer && this.markerLayer.hide();
      });

      // 地图开始缩放事件
      this.bMap.addEventListener("zoomstart", () => {
        // 关闭弹出层
        this.markerLayer && this.markerLayer.hide();
      });
    },
    /**
     * 添加轨迹点
     * @param {Point} [point] - 坐标点
     * @param {String} [txt] - 文本描述
     * @param {String} [icon] - 图标图片
     * @param {Object} [opts] - 相关参数
     * @retrun {Marker} 返回百度生成的遮罩点
     */
    addMarker(point, txt, icon, opts) {
      let _this = this;
      // 添加图标
      let _icon = new BMap.Icon(icon, new BMap.Size(opts.sizeW, opts.sizeH), {
        imageSize: new BMap.Size(opts.sizeW, opts.sizeH)
      });
      // 添加遮罩点
      let _marker = new BMap.Marker(point, {
        icon: _icon,
        offset: new BMap.Size(opts.offsetW, opts.offsetH)
      });
      // 添加标识文本
      let _label = new BMap.Label(txt, {
        offset: new BMap.Size(opts.labelOffsetW, opts.labelOffsetH)
      });

      // 设置文本样式
      _label.setStyle({
        backgroundColor: "transparent",
        width: "30px",
        lineHeight: "20px",
        padding: "0",
        border: "0",
        textAlign: "center",
        color: "#FFF",
        fontSize: "16px"
      });
      // 添加到遮罩点
      _marker.setLabel(_label);
      _marker.setZIndex(999);
      // 添加到地图
      this.bMap.addOverlay(_marker);

      // 轨迹点击处理
      _marker.addEventListener("click", function() {
        _this.map.markerIndex = this.index;
        _this.markerLayer.show(this.getPosition());
      });

      return _marker;
    },
    addMarkerLayer(point) {
      let _this = this;

      /* 自定义遮罩弹窗 S */
      function customOverlay(point) {
        this._point = point;
      }
      customOverlay.prototype = new BMap.Overlay();
      customOverlay.prototype.initialize = function(map) {
        this._map = _this.bMap;
        this._layer = _this.$refs.mapLayer;
        _this.bMap.getPanes().labelPane.appendChild(this._layer);

        // 关闭处理
        this._layer.querySelector(".close").addEventListener("click", () => {
          this._layer.style.display = "none";
        });

        return this._layer;
      };
      customOverlay.prototype.draw = function() {};
      customOverlay.prototype.show = function(point) {
        this._point = point;

        let pixel = this._map.pointToOverlayPixel(point);
        this._layer.style.display = "";
        this._layer.style.left = pixel.x - this._layer.offsetWidth / 2 + "px";
        this._layer.style.top = pixel.y - this._layer.offsetHeight - 65 + "px";
      };
      /* 自定义遮罩弹窗 E */

      let _overlay = new customOverlay(point);
      _this.bMap.addOverlay(_overlay);

      return _overlay;
    },
    addPolyline(points) {
      // 删除之前路劲
      this.bMap.getOverlays().forEach(item => {
        if (item.toString().indexOf("Marker") > 0) {
          item.index == null && this.bMap.removeOverlay(item);
        }
        if (item.toString().indexOf("Polyline") > 0) {
          this.bMap.removeOverlay(item);
        }
      });

      points.length > 1 &&
        this.$nextTick(() => {
          let _sy = new BMap.Symbol(BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW, {
            scale: 0.4, //图标缩放大小
            strokeColor: "#fff", //设置矢量图标的线填充颜色
            strokeWeight: "1" //设置线宽
          });
          let _icons = new BMap.IconSequence(_sy, "5%", "40", false);

          let _polyline = new BMap.Polyline(points, {
            enableClicking: false,
            icons: [_icons],
            strokeWeight: "10", // 折线的宽度，以像素为单位
            strokeOpacity: 0.8, // 折线的透明度，取值范围0 - 1
            strokeColor: "#6cf" // 折线颜色
          });
          // 增加折线
          this.bMap.addOverlay(_polyline);
        });
    },
    // 进度变更
    onScheduleChange(val) {
      let _newPointList = this.map.pointList.slice(0, val + 1);
      // 关闭弹出层
      this.markerLayer && this.markerLayer.hide();
      // 添加新路劲
      this.addPolyline(_newPointList);

      // 显示隐藏对应点
      this.map.markerList.forEach(item => {
        if (item.index <= val) {
          item.show();
        } else {
          item.hide();
        }
      });

      // // 重置中心点
      // let _point = this.map.pointList[val];
      // if (_point && !this.bMap.getBounds().containsPoint(_point)) {
      //   this.bMap.setCenter(_point);
      // }
    },
    // 日期选择器变更
    onPickerChange(date) {
      if (!date) return;
      this.listQuery.startTime = moment(date[0]).format("YYYY-MM-DD HH:mm:ss");
      this.listQuery.endTime = moment(date[1]).format("YYYY-MM-DD HH:mm:ss");
    },
    onSubmit() {
      // 获取用户轨迹
      getUsetTrajectory(this.listQuery).then(data => {
        this.listData = data;
        this.scheduleTime.startTime = this.listQuery.startTime;
        this.scheduleTime.endTime = this.listQuery.endTime;
        // 清空处理
        this.map.pointList = [];
        this.map.markerList = [];
        // 循环用户轨迹
        data.forEach((item, index) => {
          let _point = new BMap.Point(item.lng, item.lat);

          // 添加点
          this.map.pointList.push(_point);
          let _marker = this.addMarker(
            _point,
            index + 1,
            this.map.imgList[index === 0 ? 0 : 1],
            {
              sizeW: 30,
              sizeH: 41,
              offsetW: 0,
              offsetH: -20.5,
              labelOffsetW: 0,
              labelOffsetH: 5
            }
          );
          _marker.index = index;
          this.map.markerList.push(_marker);
        });
        // 添加遮罩弹窗
        this.markerLayer = this.addMarkerLayer(this.map.pointList[0]);
        // 添加路劲
        this.addPolyline(this.map.pointList);
        // 重新定位中心点
        let _centerView = this.bMap.getViewport(this.map.pointList);
        this.bMap.centerAndZoom(_centerView.center, _centerView.zoom);
      });
    }
  },
  components: {
    TimeSchedule
  }
};
</script>
<style lang="scss" scoped>
.trajectory-main {
  position: relative;
  height: 100%;
  .mr10 {
    margin-right: 10px;
  }
}
.map {
  position: absolute;
  top: 52px;
  right: 0;
  bottom: 56px;
  left: 0;
  /deep/ .anchorBL {
    display: none;
  }
}
.map-layer {
  position: absolute;
  top: -9999px;
  left: -9999px;
  background: #fff;
  width: 400px;
  height: 340px;
  border: 1px #dc0c0e solid;
  border-radius: 8px;
  color: #333;
  dl {
    margin: 10px 0 0;
    overflow: hidden;
    font-size: 14px;
  }
  dt {
    float: left;
    width: 100px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    color: #bbb;
  }
  dd {
    float: left;
    width: 290px;
    height: 20px;
    line-height: 20px;
    margin: 0;
  }
  .title {
    height: 32px;
    line-height: 32px;
    padding: 0 10px;
    border-bottom: 1px #ccc solid;
    font-size: 14px;
  }
  .pic {
    padding: 12px 0;
    border-bottom: 1px #ccc solid;
    img {
      display: block;
      width: 340px;
      height: 180px;
      margin: 0 auto;
    }
  }
  .arrow {
    position: absolute;
    left: 50%;
    bottom: -20px;
    width: 0;
    height: 0;
    margin-left: -20px;
    border-width: 20px 20px 0;
    border-style: solid;
    border-color: #dc0c0e transparent transparent;
  }
  .close {
    position: absolute;
    top: 0;
    right: 0;
    width: 32px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    font-style: normal;
    cursor: pointer;
  }
}
.form {
  position: absolute;
  top: 0;
  left: 0;
  background: #242b33;
  width: 100%;
  padding: 8px 10px;
  color: #fff;
}
</style>
