<template>
  <div class="app-container dataCenter-clustering-main">
    <div class="info" v-for="(item, index) in classifyData" :key="index" v-if="classifyData.length">
      <el-row>
        <el-col :span="12">
          证件号：{{item.identityNo}}
        </el-col>
        <el-col :span="12">
          相似度：{{item.similarity}}
        </el-col>
      </el-row>
      <!-- swiper -->
      <swiper class="swiper" ref="swiper" :options="swiperOption">
        <swiper-slide v-for="(face,index) in item.faceSnaps" :key="index">
          <img-show class="pic" width="100px" height="100px" txt="暂无头像" base64 :img-src="classifyData.snapIds[face.snapId].imgBase">
            <!-- <div class="mask">{{face.similarity}}</div> -->
          </img-show>
        </swiper-slide>
        <div class="swiper-pagination" slot="pagination"></div>
      </swiper>
    </div>
    <div class="submit">
      <el-button type="primary" @click="onOpen">聚类分析</el-button>
    </div>

    <!-- 抓拍弹窗 -->
    <el-dialog title="抓拍数据" class="list-layer body0" :visible.sync="dialogVisible" width="1060px">
      <div class="filter-container">
        <picture-search ref="pictureSearch" size="mini" class="filter-item w2" placeholder="名称/证件号" @change="onSearchChange"></picture-search>
        <el-date-picker size="mini" v-model="datePicker[0]" class="filter-item w2" type="datetime" format="yyyy-MM-dd HH:mm:ss" @change="onStartTimeChange" placeholder="请选择开始时间">
        </el-date-picker>
        <el-date-picker size="mini" v-model="datePicker[1]" class="filter-item w2" type="datetime" format="yyyy-MM-dd HH:mm:ss" @change="onEndTimeChange" placeholder="请选择结束时间">
        </el-date-picker>
        <el-input size="mini" @keyup.enter.native="getList" class="filter-item w1" placeholder="聚类批次ID" v-model="listQuery.clusterId"> </el-input>
        <el-select size="mini" v-model="listQuery.cameraIds" placeholder="摄像头" clearable class="filter-item w1">
          <el-option v-for="item in cameraData" :key="item.cameraId" :label="item.cameraName" :value="item.cameraId" />
        </el-select>
        <el-select size="mini" @keyup.enter.native="getList" clearable class="filter-item w1" v-model="listQuery.num" placeholder="类型">
          <el-option v-for="item in labelTypeData" :key="item.num" :label="item.label" :value="item.num" />
        </el-select>
        <el-button size="mini" class="filter-item" type="primary" @click="getList">搜索</el-button>
      </div>

      <div class="list-main">
        <div class="item" :class="{sel: snapIds[item.id]}" v-for="(item, index) in listData.rows" :key="index" @click="onChoice(item)">
          <div class="pic">
            <img :src="'data:image/jpeg;base64,' + item.imgBase">
            <div class="label-list" v-if="item.labelNames">
              <div class="top-label" v-for="(label,index) in item.labelNames.split(',')" :key="index" :style="{zIndex:10-index}">
                <span :style="{backgroundColor:label.split('|')[1],color:colorBrightness(label.split('|')[1])}">{{label.split('|')[0]}}</span>
                <i :style="{borderLeftColor:label.split('|')[1]}" class="icon"></i>
              </div>
            </div>
            <div class="mask">
              {{item.imgTimeShow}}
              <span>{{item.similarity.split('.')[0]}}%</span>
            </div>
          </div>
          <div class="box">
            <div class="txt">
              <svg-icon icon-class="user" />
              <b class="name">{{item.name}}</b>
            </div>
            <div class="txt">
              <svg-icon icon-class="credentials" />
              <label>{{item.identityNo}}</label>
            </div>
          </div>
        </div>
      </div>
      <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[100,200,300]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total"> </el-pagination>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="onSubmit">开始分析</el-button>
        <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import moment from "moment";

import "swiper/dist/css/swiper.css";
import { swiper, swiperSlide } from "vue-awesome-swiper";

import { page } from "@/api/dataCenter/catchData/index";
import { getLabelType } from "@/api/faceModule/faceLabel/index";
import { getSelectData } from "@/api/camera/index";
import { putClustering } from "@/api/dataCenter/clustering/index";

export default {
  name: "dataCenter-clustering",
  data() {
    return {
      dialogVisible: false,
      datePicker: [moment().subtract(5, "m")._d, ""],
      listData: [],

      labelTypeData: [],
      cameraData: [],

      classifyData: [],
      snapIds: {},
      listQuery: {
        timeStart: moment()
          .subtract(5, "m")
          .format("YYYYMMDDHHmmss"),
        timeEnd: "",
        keyword: "",
        image: "",
        cameraIds: null,
        num: null,
        offset: 1,
        limit: 100
      },

      swiperOption: {
        slidesPerView: "auto",
        spaceBetween: 5,
        freeMode: true
      }
    };
  },
  created() {
    this.initData();
  },
  components: {
    swiper,
    swiperSlide
  },
  methods: {
    async initData() {
      await getSelectData().then(res => {
        this.cameraData = res.data;
      });
      await getLabelType().then(res => {
        this.labelTypeData = res.data.rows;
      });
    },
    onSearchChange(val, img) {
      this.listQuery.keyword = val;
      this.listQuery.image = img;
    },
    onOpen() {
      this.dialogVisible = true;
      this.getList();
    },
    onChoice(row) {
      if (this.snapIds[row.id]) {
        this.$set(this.snapIds, row.id);
      } else {
        this.$set(this.snapIds, row.id, row);
      }
    },
    onStartTimeChange(date) {
      this.listQuery.timeStart = date
        ? moment(date).format("YYYYMMDDHHmmss")
        : "";
    },
    onEndTimeChange(date) {
      this.listQuery.timeEnd = date
        ? moment(date).format("YYYYMMDDHHmmss")
        : "";
    },
    // 判断颜色值
    judgeColor(str) {
      let color = "#409eff";
      if (str) {
        if (str.includes("黑")) {
          color = "red";
        } else if (str.includes("白")) {
          color = "green";
        } else if (str.includes("陌")) {
          color = "yellow";
        }
      }
      return color;
    },
    getList() {
      this.snapIds = {};
      page(this.listQuery).then(res => {
        this.listData = res.data;
      });
    },
    onSubmit() {
      let _ids = Object.keys(this.snapIds);
      if (_ids.length < 2) {
        this.$notify({
          title: "提示",
          message: "至少需要选中两条数据",
          type: "warning",
          duration: 2000
        });
        return;
      }

      putClustering({
        snapIds: _ids
      }).then(res => {
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

        this.classifyData = res.data;
        this.classifyData.snapIds = this.snapIds;
        this.dialogVisible = false;
        this.snapIds = {};
      });
    },
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getList();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getList();
    }
  }
};
</script>
<style lang="scss" scoped>
.dataCenter-clustering-main {
  height: 100%;
  .swiper {
    margin: 0;
  }
  .swiper-slide {
    width: 100px;
  }
  .submit {
    padding: 10px;
    clear: both;
    .el-button {
      width: 200px;
      height: 40px;
    }
  }
  .info {
    padding: 10px 0 20px;
    border-bottom: 1px dashed #666;
    .el-col {
      line-height: 30px;
    }
  }
  .filter-container {
    padding: 10px;
    border-bottom: 1px solid #eee;
    .w1 {
      width: 100px !important;
      margin-right: 6px !important;
    }
    .w2 {
      width: 180px !important;
      margin-right: 6px !important;
    }
  }
  .label-list {
    position: absolute;
    top: 0;
    left: 0;
    padding-left: 2px;
    .top-label {
      position: relative;
      float: left;
      line-height: 18px;
      margin-left: -6px;
      padding-right: 6px;
      overflow: hidden;
      font-size: 12px;
      span {
        display: block;
        padding: 0 2px 0 8px;
      }
      .icon {
        position: absolute;
        top: -9px;
        right: 0;
        width: 0;
        height: 0;
        float: left;
        border-left: 6px solid #fff;
        border-top: 9px solid transparent;
        border-bottom: 18px solid transparent;
        content: "";
      }
    }
  }
  .list-main {
    height: calc(100vh - 390px);
    margin: 0;
    overflow-y: auto;
    .el-button {
      margin-left: 0;
    }
    .pic {
      position: relative;
      display: block;
      width: 160px;
      height: 160px;
      overflow: hidden;
      img {
        display: block;
        width: 160px;
        height: 160px;
      }
    }
    .mask {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.4);
      line-height: 18px;
      padding: 0 4px;
      font-size: 12px;
      color: #fff;
      span {
        float: right;
        font-size: 14px;
        font-weight: bold;
        color: #ffc600;
      }
    }
    .item {
      float: left;
      margin: 10px 0 0 10px;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      border: 1px solid transparent;
      &.sel {
        border-color: #0fa0ff;
      }
      b {
        font-size: 14px;
        color: #333;
      }
      label {
        font-size: 12px;
        color: #9da5af;
      }
      .box {
        width: 160px;
        padding: 6px;
      }
      .txt {
        display: flex;
        width: 100%;
        height: 18px;
        line-height: 18px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .svg-icon {
        display: inline-block;
        height: 100%;
        margin-right: 4px;
        vertical-align: top;
        color: #b5c0cd;
      }
      .btns {
        margin-top: 4px;
      }
      .el-button {
        padding: 0 10px;
      }
      .el-checkbox {
        float: right;
        margin-left: 4px;
        pointer-events: none;
      }
    }
  }
  .el-pagination {
    padding: 10px;
  }
}
</style>
