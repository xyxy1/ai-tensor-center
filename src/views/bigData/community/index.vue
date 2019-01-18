<template>
  <div class="app-container">
    <el-row class="main">
      <el-col :span="10" class="left-box">
        <div class="pic">
          <img :src="form.realMapUrl">
        </div>
        <el-upload class="upload" action="" accept=".jpeg,.jpg,.png,.bmp" :auto-upload="false" :show-file-list="false" :on-change="onUpload">
          <el-button size="small">上传小区全景图</el-button>
        </el-upload>
      </el-col>
      <el-col :span="14">
        <el-form ref="form" :model="form" :rules="formRules" label-width="120px">
          <el-form-item label="小区名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="小区地址" prop="address">
            <el-input v-model="form.address"></el-input>
          </el-form-item>
          <el-form-item label="小区地图" prop="map">
            <el-button icon="el-icon-edit-outline" @click="dialogVisible = true">编辑</el-button>
            <span>（请先填写准确的小区地址）</span>
          </el-form-item>
          <el-form-item label="人脸视窗标题" prop="faceViewTitle">
            <el-input v-model="form.faceViewTitle"></el-input>
          </el-form-item>
          <el-form-item label="车辆视窗标题" prop="carViewTitle">
            <el-input v-model="form.carViewTitle"></el-input>
          </el-form-item>
          <el-form-item label="小区简介" prop="description">
            <el-input type="textarea" resize="none" :autosize="{ minRows: 4 }" v-model="form.description"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onUpdate">保存</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-dialog title="小区地图" class="map-layer body0" :visible.sync="dialogVisible" width="800px">
      <div class="header">
        <el-button size="mini" type="success" icon="el-icon-edit" @click="isEditMap = !isEditMap">{{isEditMap?'结束':'开始'}}绘制小区区域</el-button>
        <el-button size="mini" type="danger" @click="onEmptyPolygon">清空绘制区域</el-button>
        <el-autocomplete size="mini" v-model="locationDetailAddr" :fetch-suggestions="placeSearch" placeholder="请输入查询地址" @select="onAutoSelect"></el-autocomplete>
      </div>
      <div class="map-inner" id="map"></div>
      <div slot="footer">
        <el-button size="mini" @click="dialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="onMapUpdate">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getCommunity, putCommunity } from "@/api/bigData/community";

export default {
  name: "base-communityManager",
  data: () => ({
    aMap: null,
    isEditMap: false,
    mapPointArr: [],
    mapPolygon: null,
    locationDetailAddr: "",
    dialogVisible: false,

    image: {
      width: 1200,
      height: 760
    },
    form: {
      name: null,
      address: null,
      faceViewTitle: null,
      carViewTitle: null,
      description: null,
      map: [],
      realMap: null
    },
    formRules: {
      name: [{ required: true, message: "小区名称不能为空" }],
      address: [{ required: true, message: "小区地址不能为空" }],
      map: [{ required: true, message: "请配置小区地图" }]
    }
  }),
  created() {
    this.getCommunity();
  },
  watch: {
    dialogVisible(val) {
      if (val && this.aMap == null) {
        // 初始化地图
        this.$nextTick(() => {
          this.initMap();
        });
      }
      if (val) {
        this.mapPointArr = this.form.map.concat();

        if (this.mapPointArr.length > 2) {
          this.mapPolygon.setPath(this.mapPointArr.concat());
        }
      }
    },
    isEditMap(val) {
      if (val) {
        this.mapPointArr.map(item => {
          new AMap.CircleMarker({
            map: this.aMap,
            center: item,
            radius: 4,
            strokeColor: "#000",
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: "#000",
            fillOpacity: 0.3
          });
        });
      } else {
        this.aMap.remove(this.aMap.getAllOverlays("CircleMarker"));
      }
    }
  },
  methods: {
    // 地图初始化地图
    initMap() {
      // 高德地图调用开始
      this.aMap = new AMap.Map("map", {
        resizeEnable: true,
        zoom: 16
      });
      this.mapPolygon = new AMap.Polygon({
        map: this.aMap,
        path: this.mapPointArr,
        strokeColor: "#0fa0ff",
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: "#0fa0ff",
        fillOpacity: 0.3
      });

      // 重新定位中心点
      this.aMap.setFitView();

      // 增加点击绘制地图
      this.aMap.on("click", e => {
        if (!this.isEditMap) return;

        let _arr = [e.lnglat.lng, e.lnglat.lat];
        this.mapPointArr.push(_arr);
        new AMap.CircleMarker({
          map: this.aMap,
          center: _arr,
          radius: 4,
          strokeColor: "#000",
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: "#000",
          fillOpacity: 0.3
        });

        if (this.mapPointArr.length > 2) {
          this.mapPolygon.setPath(this.mapPointArr.concat());
        }
      });
    },
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
    onAutoSelect(val) {
      // 设置中心点
      if (val.lng && val.lat) {
        this.aMap.setCenter(new AMap.LngLat(val.lng, val.lat));
      }
    },
    getCommunity() {
      getCommunity().then(res => {
        if (res.status == 200) {
          this.form = res.data;
        }
      });
    },
    onUpload(file) {
      let reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.addEventListener("load", () => {
        var image = new Image();
        image.addEventListener("load", () => {
          if (
            image.width == this.image.width &&
            image.height == this.image.height
          ) {
            this.form.realMap = reader.result;
            this.form.realMapUrl = reader.result;
          } else {
            this.$notify({
              title: "提示",
              message: `小区全景图尺寸必须为${this.image.width}X${
                this.image.height
              }`,
              type: "warning",
              duration: 2000
            });
          }
        });
        image.src = reader.result;
      });
    },
    onUpdate() {
      this.$refs.form.validate(valid => {
        if (!valid) return false;

        let _form = Object.assign({}, this.form);
        delete _form.realMapUrl;

        putCommunity(this.form.id, _form).then(res => {
          let isSuccess = res.status === 200;
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "保存成功" : res.message,
            type: isSuccess ? "success" : "error",
            duration: 2000
          });

          // 保存成功更新数据
          isSuccess && this.getCommunity();
        });
      });
    },
    onMapUpdate() {
      if (this.isEditMap) {
        this.$notify({
          title: "提示",
          message: `请先结束绘制`,
          type: "warning",
          duration: 2000
        });
        return;
      }

      if (this.mapPointArr.length < 3) {
        this.$notify({
          title: "提示",
          message: `请绘制小区区域`,
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.form.map = this.mapPointArr.concat();
      this.dialogVisible = false;
    },
    onEmptyPolygon() {
      this.mapPointArr = [];
      this.mapPolygon.setPath(this.mapPointArr.concat());
      this.aMap.remove(this.aMap.getAllOverlays("CircleMarker"));
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  position: relative;
  height: 100%;
  .main {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 820px;
    transform: translate(-50%, -50%);
  }
  .left-box {
    text-align: center;
    .pic {
      background: #e3e7e9;
      overflow: hidden;
      border-radius: 8px;
      img {
        display: block;
        width: 100%;
      }
    }
    .el-button {
      margin-top: 20px;
    }
  }
  .el-form {
    /deep/ .el-form-item__label {
      font-size: 13px;
      color: #3f4041;
    }
    span {
      font-size: 13px;
      color: #999;
    }
  }
}

.map-layer {
  .header {
    height: 46px;
    line-height: 46px;
    padding: 0 10px;
  }
  .el-autocomplete {
    float: right;
    width: 280px;
  }
  .map-inner {
    width: 100%;
    height: 450px;
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
