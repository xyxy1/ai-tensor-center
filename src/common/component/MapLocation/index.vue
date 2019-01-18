<template>
  <el-dialog title="地址选择" :visible.sync="dialogVisible" :appendToBody="true" width="60%">
    <div class="map-outer">
      <div class="header">
        <div class="qry-addr">
          <el-autocomplete v-model="locationDetailAddr" :fetch-suggestions="placeSearch" placeholder="请输入查询地址" @select="onAutoSelect"></el-autocomplete>
        </div>
        <div class="cur-location">
          <div class="location-header">
            经度：<input class="location-input" v-model="outLocation.lng" @input="modLocate" />&nbsp;&nbsp;
            纬度：<input class="location-input" v-model="outLocation.lat" @input="modLocate" />&nbsp;&nbsp;
          </div>
        </div>
      </div>
      <div class="map-inner" ref="map"></div>
    </div>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="chooseLocation">确定</el-button>
      <el-button size="mini" @click="close">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    zoom: {
      default: 12,
      type: Number
    },
    region: Array
  },
  data: function() {
    return {
      dialogVisible: false,
      position: {},
      aMap: null,
      marker: null,
      geoc: null,
      inLocation: {},
      outLocation: {},
      locationDetailAddr: ""
    };
  },
  methods: {
    /**
     * 打开位置选择器弹框
     * @param location 格式：{lng:127, lat:28, addr:'', detailAddr:''}
     */
    open(location) {
      this.inLocation = Object.assign({}, location);
      this.outLocation = Object.assign({}, location);
      this.marker = null;
      this.locationDetailAddr = "";
      this.dialogVisible = true;
      if (this.aMap) {
        this.marker = null;
        this.aMap.clearMap();
        this.autoLocate();
      } else {
        this.$nextTick(() => {
          this.initMap();
        });
      }
    },

    /**
     * 关闭弹层
     */
    close() {
      this.dialogVisible = false;
    },

    /**
     * 地图初始化地图
     */
    initMap() {
      // 高德地图调用开始
      this.aMap = new AMap.Map(this.$refs.map, {
        resizeEnable: true,
        animateEnable: false
      });

      // 设置中心点
      if (this.inLocation.lng && this.inLocation.lat) {
        this.aMap.setCenter(
          new AMap.LngLat(this.inLocation.lng, this.inLocation.lat)
        );
      }

      // 地图工具控件
      this.aMap.plugin(["AMap.ToolBar"], () => {
        this.aMap.addControl(
          new AMap.ToolBar({
            position: "LB"
          })
        );
      });

      // 增加点击地图选中事件
      this.aMap.on("click", e => {
        this.addMarker({
          lng: e.lnglat.lng,
          lat: e.lnglat.lat
        });
      });

      // 地图加载完成后
      this.aMap.on("complete", () => {
        // 自动标点
        this.autoLocate();
      });
      // this.geoc = new BMap.Geocoder();
    },

    /**
     * 地图地点搜索
     */
    placeSearch(txt, cb) {
      // 添加搜索控件
      this.aMap.plugin(["AMap.PlaceSearch"], () => {
        let _placeSearch = new AMap.PlaceSearch({
          //构造地点查询类
          pageSize: 5,
          pageIndex: 1,
          autoFitView: false
        });
        //关键字查询
        _placeSearch.search(txt, (status, data) => {
          if (status === "complete") {
            let _arr = [];
            data.poiList.pois.forEach(item => {
              _arr.push({
                value: item.name,
                lng: item.location.lng,
                lat: item.location.lat
              });
            });
            cb(_arr);
          }
          return false;
        });
      });
    },

    /**
     * 地图地点搜索
     */
    onAutoSelect(val) {
      // 设置中心点
      if (val.lng && val.lat) {
        this.aMap.setCenter(new AMap.LngLat(val.lng, val.lat));
      }
    },

    /**
     * 向地图添加marker标记点并设置地址信息
     */
    addMarker(point) {
      var _point = [point.lng, point.lat];
      this.aMap.remove(this.aMap.getAllOverlays("marker"));
      // 添加点
      this.marker = new AMap.Marker({
        map: this.aMap,
        position: _point
      });
      // 中心点移动
      this.aMap.panTo(_point);
      // 更新坐标
      this.outLocation = Object.assign({}, this.outLocation, point, {
        zoom: this.aMap.getZoom()
      });
    },

    /**
     * 当前地图没有marker时进行自动定位
     */
    autoLocate() {
      if (!this.marker) {
        if (this.region && this.region.length > 2) {
          new AMap.Polygon({
            map: this.aMap,
            path: this.region,
            bubble: true,
            cursor: "default",
            strokeColor: "#0fa0ff",
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: "#0fa0ff",
            fillOpacity: 0.2
          });

          // 重新定位中心点
          this.aMap.setFitView();
        }

        if (this.outLocation.lng && this.outLocation.lng) {
          this.addMarker({
            lng: this.outLocation.lng,
            lat: this.outLocation.lat
          });
        } else {
          var _point = this.aMap.getCenter();
          this.addMarker({
            lng: _point.lng,
            lat: _point.lat
          });
        }
      }
    },

    /**
     * 根据传入组件传入坐标或查询地址重新定位marker
     */
    qryLocate() {
      if (this.locationDetailAddr) {
        this.geoc.getPoint(this.locationDetailAddr, point => {
          if (point) {
            this.addMarker(point);
          }
        });
      }
    },

    /**
     * 修改坐标后重新设置marker
     */
    modLocate() {
      this.addMarker({
        lng: this.outLocation.lng,
        lat: this.outLocation.lat
      });
    },

    /**
     * 确定选中地址
     */
    chooseLocation() {
      this.$emit("local", this.outLocation);
      this.close();
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.map-outer {
  width: 100%;
  position: relative;
  .header {
    position: absolute;
    top: 5px;
    left: 10px;
    z-index: 100;
    width: 98%;

    .qry-addr {
      float: left;
      width: 50%;
      .el-autocomplete {
        width: 100%;
      }
    }

    .cur-location {
      float: right;
      width: 290px;
      padding: 5px 5px 5px 5px;
      background-color: #fff;
      text-align: right;

      .location-header {
        /*text-align: right;*/

        input {
          width: 80px;
          -webkit-appearance: none;
          border-radius: 4px;
          border: 1px solid #dcdfe6;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          color: #606266;
          display: inline-block;
          font-size: 12px;
          height: 28px;
          line-height: 28px;
          outline: 0;
          padding: 0 6px;
          -webkit-transition: border-color 0.2s
            cubic-bezier(0.645, 0.045, 0.355, 1);
          transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        }
      }

      .location-footer {
        padding: 3px 7px 0px 0px;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  .map-inner {
    width: 100%;
    height: 520px;
    /deep/ {
      .amap-logo,
      .amap-copyright {
        display: none !important;
      }
    }
  }
  .dialog-footer {
    margin-top: 20px;
  }
}
</style>
