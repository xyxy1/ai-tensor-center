<template>
  <div class="app-container calendar-list-container">
    <div ref="filter" class="p10">
      <el-date-picker size="mini" v-model="value5[0]" class="filter-item" type="datetime" format="yyyy-MM-dd HH:mm:ss" @change="handleStartTimeChange" placeholder="请选择开始时间" :picker-options="singlePickerOptions()" />
      <el-date-picker size="mini" v-model="value5[1]" class="filter-item" type="datetime" format="yyyy-MM-dd HH:mm:ss" @change="handleEndTimeChange" placeholder="请选择结束时间" :picker-options="singlePickerOptions(value5[0])" />
      <el-input size="mini" @keyup.enter.native="handleFilter" style="width: 160px;" class="filter-item" placeholder="姓名/证件号" v-model="listQuery.keyword" />
      <el-input size="mini" @keyup.enter.native="handleFilter" style="width: 160px;" class="filter-item" placeholder="聚类批次ID" v-model="listQuery.clusterId" />
      <el-select size="mini" @keyup.enter.native="handleFilter" style="width: 160px;" class="filter-item" v-model="listQuery.cameraIds" placeholder="全部" clearable>
        <el-option v-for="item in cameraData" :key="item.cameraId" :label="item.cameraName" :value="item.cameraId" />
      </el-select>
      <el-select size="mini" @keyup.enter.native="handleFilter" style="width: 160px;" class="filter-item" v-model="listQuery.num" placeholder="全部" clearable>
        <el-option v-for="item in labelTypeData" :key="item.num" :label="item.label" :value="item.num" />
      </el-select>
      <el-button size="mini" class="filter-item" type="primary" @click="handleFilter">搜索</el-button>
      <el-button size="mini" class="filter-item" type="primary" @click="handleDownload">全部导出</el-button>
    </div>

    <div class="list-main" :style="{height:height}" ref="list">
      <div class="item" :span="8" v-for="(o, index) in list" :key="index" :offset="index > 0 ? 2 : 0">
        <el-tooltip v-if="tooltipDestroy" placement="right" :open-delay="200" effect="light">
          <el-card :body-style="{ padding: '0px' }">
            <div class="image-top">
              <div class="label-wrap">
                <div class="top-label" v-for="(value, key) in strToArr(o.labelNames)" :key="key">
                  <div class="label-rect" :style="'background-color:' + judgeColor(value)">{{value.slice(0, 1)}}</div>
                  <div class="label-trangle" :style="'border-left-color:' + judgeColor(value)"></div>
                </div>
              </div>
              <img :src="'data:image/jpeg;base64,' + o.imgBase" class="image">
              <div class="bottom-shadow">
                <span class="time">{{o.imgTimeShow}}</span>
                <el-button type="text" class="button" @click="getBg(o)">背景</el-button>
              </div>
            </div>
            <div class="p10">
              <div class="name">
                <svg-icon icon-class='custom' class-name="svg-icon" />
                <span>{{o.name}}</span>
                <add-modal v-if="!o.identityNo" @save="handleAdd" :id="o.id" class="btn">
                  <el-button type="text">添加</el-button>
                </add-modal>
                <change-modal v-else @save="handleJudge" :id="o.id" :oldIdentityNo="o.identityNo" class="btn">
                  <el-button type="text">变更</el-button>
                </change-modal>
              </div>
              <div class="cameraName">
                <svg-icon icon-class='locale' class-name="svg-icon" />
                <span>{{o.cameraName}}</span>
              </div>
            </div>
          </el-card>
          <div slot="content">
            <p>ID：{{o.id}}</p>
            <p>分数：{{o.score}}</p>
            <p>清晰度：{{o.clarity}}</p>
            <p>角度：{{o.degree}}</p>
            <p>相似度：{{o.similarity}}</p>
            <p>聚类批次ID：{{o.clusterId}}</p>
            <p>聚类组ID：{{o.clusterGroupId}}</p>
            <p>标记类型：{{o.markingType}}</p>
          </div>
        </el-tooltip>
      </div>
    </div>
    <div v-show="!listLoading" class="pagination-container p10">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.offset" :page-sizes="[100,200,300]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </div>

    <el-dialog title="背景大图" :visible.sync="dialogFormVisible">
      <el-card :body-style="{ padding: '0px' }">
        <img :src="bg" class="inner-image">
      </el-card>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";
import { singlePickerOptions } from "@/utils";

import {
  page,
  addObj,
  getObj,
  delObj,
  putObj,
  addImg,
  changeIdentity,
  getSnapZip
} from "@/api/dataCenter/catchData/index";
import { getSelectData } from "@/api/camera/index";
import { getLabelType } from "@/api/faceModule/faceLabel/index";
import AddModal from "./components/AddModal";
import ChangeModal from "./components/ChangeModal";

export default {
  name: "dataCenter-catchData",
  components: { AddModal, ChangeModal },
  data() {
    return {
      singlePickerOptions: singlePickerOptions,

      scroll: 0,
      height: "calc(100vh - 240px)",
      value5: [moment().subtract(5, "m")._d, ""],
      listQuery: {
        offset: 1,
        limit: 100,
        timeStart: moment(moment().subtract(5, "m")).format("YYYYMMDDHHmmss"),
        timeEnd: "",
        cameraIds: undefined,
        keyword: undefined,
        num: undefined,
        clusterId: undefined
      },
      getBglist: {
        imgTime: undefined,
        cameraId: undefined,
        imgFrame: undefined
      },
      list: null,
      total: null,
      listLoading: true,
      dialogFormVisible: false,
      dialogStatus: "",
      tableKey: 0,
      bg: undefined,

      tooltipDestroy: true,

      cameraData: [],
      labelTypeData: [],
      idList: ""
    };
  },
  created() {
    this.initData();
  },
  mounted() {
    this.height =
      this.$root.$el.offsetHeight - this.$refs.filter.offsetHeight - 190 + "px";
    window.addEventListener("resize", () => {
      this.height =
        this.$root.$el.offsetHeight -
        this.$refs.filter.offsetHeight -
        190 +
        "px";
    });
  },
  activated() {
    this.$refs.list.scrollTo(0, this.scroll);
    this.tooltipDestroy = true;
  },
  deactivated() {
    this.scroll = this.$refs.list.scrollTop;
    this.tooltipDestroy = false;
  },
  methods: {
    async initData() {
      await getSelectData().then(res => {
        this.cameraData = res.data;
      });
      await getLabelType().then(res => {
        this.labelTypeData = res.data.rows;
      });
      this.getList();
    },
    getList() {
      this.listLoading = true;
      this.tooltipDestroy = false;
      page(this.listQuery).then(res => {
        this.list = res.data.rows;
        this.total = res.data.total;
        this.listLoading = false;
        this.tooltipDestroy = true;

        this.idList = res.data.rows.map(item => item.id).join(",");
      });
    },
    getBg(bgData) {
      this.dialogFormVisible = true;
      this.bg = bgData.bgImgUrl;
    },
    handleFilter() {
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.offset = val;
      this.getList();
    },
    handleStartTimeChange(date) {
      this.listQuery.timeStart = date
        ? moment(date).format("YYYYMMDDHHmmss")
        : "";
    },
    handleEndTimeChange(date) {
      this.listQuery.timeEnd = date
        ? moment(date).format("YYYYMMDDHHmmss")
        : "";
    },
    // 分割字符串，转成数组
    strToArr(str) {
      return str.split(",");
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
    // 添加操作
    handleAdd(data) {
      addImg(data).then(response => {
        if (response.status == 200) {
          this.$message({
            message: "添加成功！",
            type: "success"
          });
          this.handleFilter();
        } else {
          this.$message.error(response.message);
        }
      });
    },
    // 变更操作
    handleJudge(data) {
      changeIdentity(data).then(response => {
        if (response.status == 200) {
          this.$message({
            message: "变更成功！",
            type: "success"
          });
          this.handleFilter();
        } else {
          this.$message.error(response.message);
        }
      });
    },
    // 下载
    handleDownload() {
      getSnapZip(this.listQuery).then(res => {
        let isSuccess = res.status === 200;
        if (!isSuccess) {
          this.$notify({
            title: "失败",
            message: response.message,
            type: "error",
            duration: 2000
          });
          return;
        }

        window.open(res.data);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.calendar-list-container {
  .p10 {
    padding: 10px;
  }
  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }
  .button {
    padding: 0;
    float: right;
  }
  .image {
    width: 100%;
    height: 180px;
    display: block;
  }
  .inner-image {
    width: 100%;
    display: block;
  }
  .image-top {
    width: 100%;
    position: relative;
  }
  .bottom-shadow {
    width: 100%;
    height: 30px;
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 0 4px;
    padding-top: 6px;
  }
  .label-wrap {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
  }
  .top-label {
    float: left;
    overflow: hidden;
    &:nth-of-type(n + 2) {
      margin-left: -15px;
    }
  }
  .label-rect {
    float: left;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #2e2e2e;
    font-size: 15px;
  }
  .label-trangle {
    width: 0;
    height: 0;
    float: left;
    border-left: 30px solid #409eff;
    border-top: 30px solid transparent;
    border-bottom: 30px solid transparent;
    transform: translateY(-30px);
  }
  .svg-icon {
    font-size: 14px;
    vertical-align: top;
  }
  .btn-group {
    overflow: hidden;
    padding: 4px;
  }
  .list-main {
    overflow-y: auto;
    .item {
      float: left;
      width: 180px;
      margin-bottom: 10px;
      margin-right: 20px;
    }
    .time {
      font-size: 14px;
      color: #fff;
    }
    .name {
      display: flex;
      line-height: 26px;
      margin-bottom: 4px;
      span {
        flex: 1;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .svg-icon {
        position: relative;
        top: 6px;
        margin-right: 4px;
      }
    }
    .btn {
      float: right;
      font-size: 15px;
    }
    .cameraName {
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      .svg-icon {
        position: relative;
        top: 3px;
      }
    }
    .el-button {
      padding: 0;
    }
    .el-card__body {
      width: 180px;
    }
  }
}
</style>
<style lang="scss">
body,
html {
  height: 100%;
  overflow: hidden;
}
</style>