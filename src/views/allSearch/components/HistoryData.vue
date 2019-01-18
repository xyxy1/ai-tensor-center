<template>
  <div class="history-data">
    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="info">
        <img-show class="pic" width="32px" height="32px" text="暂无头像" :base64="!data.identityImg.includes('.')" :img-src="data.identityImg" />
        <div class="name">{{data.name}}</div>
        <p>{{data.identityNo}}</p>
      </div>

      <!-- 表单筛选 -->
      <el-form class="form" @keyup.enter.native="onSubmit">
        <span>时间</span>
        <el-date-picker size="mini" v-model="pickerValue[0]" type="datetime" @change="onStartTimeChange" placeholder="请选择开始时间" :picker-options="singlePickerOptions()" />
        <el-date-picker size="mini" v-model="pickerValue[1]" type="datetime" @change="onEndTimeChange" placeholder="请选择结束时间" :picker-options="singlePickerOptions(pickerValue[0])" />
        <span>摄像头</span>
        <el-select size="mini" v-model="listQuery.cameraIds" placeholder="全部" clearable>
          <el-option v-for="item in cameraData" :key="item.cameraId" :label="item.cameraName" :value="item.cameraId" />
        </el-select>
        <el-button size="mini" type="primary" @click="onSubmit">开始分析</el-button>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form>

      <div class="right">
        <el-button-group class="switch">
          <el-button :type="mode===0?'primary':'info'" @click="mode=0" size="mini">
            <svg-icon icon-class="category" />
          </el-button>
          <el-button :type="mode===1?'primary':'info'" @click="mode=1" size="mini">
            <svg-icon icon-class="images" />
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 表格模式 S -->
    <el-table v-show="mode == 0" ref="listTabel" :data="listTableData.rows" height="calc(100vh - 256px)" v-loading.body="listTableLoading" highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="50">
      </el-table-column>
      <el-table-column align="center" width="70" label="照片">
        <template slot-scope="scope">
          <img-show class="pic" width="48px" height="48px" text="暂无头像" base64 :img-src="scope.row.imgBase" />
        </template>
      </el-table-column>
      <el-table-column width="180px" prop="name" label="姓名/证件号">
        <template slot-scope="scope">
          <div class="identity">
            <label>{{scope.row.name}}</label>
            <p>{{scope.row.identityNo}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="cameraName" label="摄像头" />
      <el-table-column prop="imgTimeShow" label="抓拍时间" />
      <el-table-column align="center" width="80" label="相似度">
        <template slot-scope="scope">
          {{scope.row.similarity}}%
        </template>
      </el-table-column>
      <el-table-column label="类别" width="110px">
        <template slot-scope="scope">
          <div class="label-box">
            <span class="label-item" v-if="scope.row.labelNames" v-for="(label,index) in scope.row.labelNames.split(',')" :key="index" :style="{backgroundColor:label.split('|')[1],color:colorBrightness(label.split('|')[1])}">{{label.split('|')[0]}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" width="60" prop="sex" label="性别" />
      <el-table-column align="center" width="60" prop="age" label="年龄" />
      <el-table-column fixed="right" min-width="70" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="info" @click="onLookPicture(scope.row)">背景</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格模式 E -->

    <!-- 卡片模式 S -->
    <div class="card-list" v-show="mode == 1">
      <div class="item" :class="{sel: listIds.includes(item.id)}" v-for="item in listTableData.rows" :key="item.id" @click="$refs.listTabel.toggleRowSelection(item)">
        <div class="pic">
          <img :src="'data:image/jpeg;base64,' + item.imgBase">
          <div class="label-list">
            <div class="top-label" v-if="item.labelNames" v-for="(label,index) in item.labelNames.split(',')" :key="index" :style="{zIndex:10-index}">
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
            <el-checkbox :value="listIds.includes(item.id)" />
          </div>
          <div class="txt">
            <svg-icon icon-class="credentials" />
            <label>{{item.identityNo}}</label>
          </div>
          <div class="btns">
            <el-button class="w100" size="mini" @click.stop="onLookPicture(item)">背景</el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 卡片模式 E -->

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total"></el-pagination>

    <!-- 图片弹窗 -->
    <el-dialog title="背景大图" :visible.sync="isBgDialog">
      <img :src="rowBgImg" class="w100">
    </el-dialog>
  </div>
</template>
<script>
import moment from "moment";
import { singlePickerOptions } from "@/utils";

import { page, getSnapZip } from "@/api/dataCenter/catchData/index";
import { getSelectData } from "@/api/camera/index";

export default {
  props: {
    data: [Array, Object]
  },
  data: () => ({
    mode: 0,
    moment: moment,
    singlePickerOptions: singlePickerOptions,

    isBgDialog: false, // 控制背景图显示
    rowBgImg: null,

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
      limit: 15
    },
    listIds: [],
    listTableData: {},
    listTableLoading: false,

    cameraData: [],
    labelTypeData: [],

    pickerValue: [moment().subtract(5, "m")._d, ""]
  }),
  methods: {
    init() {
      this.listQuery.keyword = this.data.identityNo;

      this.initData();
      this.onSubmit();
    },
    async initData() {
      await getSelectData().then(res => {
        this.cameraData = res.data;
      });
    },
    // 日期选择器变更
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
    onSubmit() {
      this.listTableLoading = true;
      page(this.listQuery)
        .then(res => {
          this.listTableData = res.data;
        })
        .finally(() => {
          this.listTableLoading = false;
        });
    },
    onResetForm() {
      this.listQuery = {
        timeStart: moment()
          .subtract(5, "m")
          .format("YYYYMMDDHHmmss"),
        timeEnd: "",
        keyword: this.data.identityNo,
        image: "",
        cameraIds: null,
        num: null,
        offset: 1,
        limit: 15
      };
      this.pickerValue = [moment().subtract(5, "m")._d, ""];
      this.$refs.pictureSearch.reset();
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    // 分页更新
    onListLimit(val) {
      this.listQuery.limit = val;
      this.onSubmit();
    },
    // 分页更新
    onListPaging(val) {
      this.listQuery.offset = val;
      this.onSubmit();
    },
    // 查看大图
    onLookPicture(data) {
      this.rowBgImg = data.bgImgUrl;
      this.isBgDialog = true;
    }
  }
};
</script>
<style lang="scss" scoped>
.history-data {
  .w100 {
    width: 100%;
  }
  .common-tool {
    border-top: 0;
    overflow: hidden;
    .info {
      position: relative;
      float: left;
      width: 200px;
      height: 40px;
      line-height: 140%;
      padding: 4px 6px 0 0;
      font-size: 13px;
      color: #9da5af;
      &:before {
        position: absolute;
        top: 50%;
        right: 0;
        background: #d2d5d6;
        width: 1px;
        height: 20px;
        margin-top: -10px;
        content: "";
      }
      .img-show {
        float: left;
        margin-right: 6px;
        border: 1px solid #dfe2e5;
        border-radius: 1px;
      }
      .name {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .form {
    width: calc(100% - 300px);
    overflow: hidden;
    span {
      display: inline-block;
      padding: 0 2px 0 10px;
      text-align: right;
      font-size: 13px;
      color: #3f4041;
    }
    .el-date-editor {
      width: 330px;
    }
    .el-select {
      width: 100px;
    }
    .el-input {
      width: 180px;
    }
    .picture-search {
      width: 140px;
    }
    .el-button {
      margin-left: 0;
    }
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
.el-pagination {
  padding: 10px;
}
.el-table {
  .identity {
    line-height: 140%;
    label {
      font-size: 14px;
    }
    p {
      color: #9da5af;
    }
  }
  .pic {
    display: block;
    width: 48px;
    height: 48px;
    border-radius: 4px;
  }
  .label-box {
    padding: 4px 0 0;
  }
  .label-item {
    display: inline-block;
    height: 22px;
    line-height: 18px;
    padding: 0 3px;
    margin: 0 4px 4px;
    text-align: center;
    border: 2px #fff solid;
    border-radius: 99px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    font-size: 12px;
    color: #fff;
  }
  .el-button {
    margin: 2px 0;
  }
}
.card-list {
  height: calc(100vh - 262px);
  overflow: auto;
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
</style>
