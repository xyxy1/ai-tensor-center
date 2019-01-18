<template>
  <div class="together-group-data">

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
        <el-date-picker size="mini" v-model="pickerValue" type="datetimerange" :picker-options="pickerOptions" range-separator="|" @change="onPickerChange" start-placeholder="开始日期" end-placeholder="结束日期" align="center" :clearable="false" :editable="false">
        </el-date-picker>
        <el-button size="mini" type="primary" @click="onSubmit">开始分析</el-button>
        <el-button size="mini" @click="onReset">重置</el-button>
      </el-form>
    </div>

    <!-- 数据展示 -->
    <el-table :data="listTableData.rows" class="table" v-loading="listTableLoading" height="calc(100vh - 256px)">
      <el-table-column align="center" label="分析对象" width="100">
        <template slot-scope="scope">
          <img-show width="48px" height="48px" txt="暂无头像" :img-src="scope.row.identityImg"></img-show>
        </template>
      </el-table-column>
      <el-table-column label="姓名/证件号" width="180">
        <template slot-scope="scope">
          <div class="identity">
            <label>{{scope.row.name}}</label>
            <p>{{scope.row.identityNo}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="num" label="同行人数" width="100">
        <template slot-scope="scope">
          {{scope.row.num}}人
        </template>
      </el-table-column>
      <el-table-column prop="togetherAddr" label="最后抓拍地址"></el-table-column>
      <el-table-column prop="togetherTime" label="最后抓拍时间"></el-table-column>
      <el-table-column label="操作" fixed="right" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="onDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,100,250]" :page-size="listQuery.limit" :total="listTableData.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>

    <!-- 同行详情 -->
    <el-dialog title="同行详情" class="detail-layer body0" :visible.sync="isDialogDateil" width="850px">
      <el-row>
        <el-col :span="9" class="info segmentation">
          <img-show width="80px" height="80px" txt="暂无头像" :img-src="detailData.snapImgBase"></img-show>
          <div class="title t1">被同行人：</div>
          <div class="txt name">
            <svg-icon icon-class="user" />
            <b>{{detailData.name}}</b>
            <div class="label-box" v-if="detailData.labelNames">
              <span class="label-item" v-for="(item,index) in detailData.labelNames.split(',')" :key="index" :style="{backgroundColor:item.split('|')[1],color:colorBrightness(item.split('|')[1])}">{{item.split('|')[0]}}</span>
            </div>
          </div>
          <div class="txt">
            <svg-icon icon-class="credentials" />
            <label>{{detailData.identityNo}}</label>
          </div>
        </el-col>
        <el-col :span="15" class="more">
          <img :src="detailData.snapBgUrl" @click="onLookPicture(detailData.snapBgUrl)" class="bg">
          <div class="txt">
            <p>摄像头：{{detailData.togetherAddr}}</p>
            <p>抓拍时间：{{detailData.togetherTime}}</p>
          </div>
          <div class="num" v-if="detailData.records"><b>{{detailData.records.length}}</b>人</div>
        </el-col>
      </el-row>
      <el-table :data="detailData.records" class="table" height="calc(100vh - 220px)" max-height="600px">
        <el-table-column align="center" label="头像" width="80">
          <template slot-scope="scope">
            <img-show width="48px" height="48px" txt="暂无头像" :img-src="scope.row.snapImgBase" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="背景图">
          <template slot-scope="scope">
            <a @click="onLookPicture(scope.row.snapBgUrl)">
              <img-show height="48px" txt="暂无背景" :img-src="scope.row.snapBgUrl" class="pic" />
            </a>
          </template>
        </el-table-column>
        <el-table-column label="姓名/证件号" width="180px">
          <template slot-scope="scope">
            <div class="identity">
              <label>{{scope.row.name}}</label>
              <p>{{scope.row.identityNo}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="snapTime" label="抓拍时间"></el-table-column>
      </el-table>

      <div slot="footer">
        <el-button size="mini" @click="isDialogDateil=false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 图片弹窗 -->
    <el-dialog title="背景大图" :visible.sync="isBgDialog">
      <img :src="rowBgImg" class="w100">
    </el-dialog>
  </div>
</template>
<script>
import moment from "moment";
import { pickerOptions } from "@/utils";
import {
  getTogetherGroupList,
  getTogetherGroupDetail
} from "@/api/togetherGroup";

export default {
  name: "togetherGroup",
  props: {
    data: [Array, Object]
  },
  data() {
    return {
      isBgDialog: false, // 控制背景图显示
      rowBgImg: null,

      isDialogDateil: false,
      listQuery: {
        timeStart: moment()
          .subtract(1, "d")
          .format("YYYYMMDDHHmmss"),
        timeEnd: moment().format("YYYYMMDDHHmmss"),
        keyword: "",
        image: "",
        offset: 1,
        limit: 15
      },
      listTableData: {}, // 同行列表返回的数据
      listTableLoading: false,
      detailData: {}, // 同行详情
      pickerValue: [moment().subtract(1, "d"), moment()],
      pickerOptions: pickerOptions
    };
  },
  methods: {
    init() {
      this.listQuery.keyword = this.data.identityNo;

      this.onSubmit();
    },
    // 日期选择器变更
    onPickerChange(date) {
      if (!date) return;
      this.listQuery.timeStart = moment(date[0]).format("YYYYMMDDHHmmss");
      this.listQuery.timeEnd = moment(date[1]).format("YYYYMMDDHHmmss");
    },
    onDetail(row) {
      getTogetherGroupDetail({
        identityNo: row.identityNo,
        groupId: row.groupId
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

        this.detailData = res.data;
        this.isDialogDateil = true;
      });
    },
    onReset() {
      this.listQuery = {
        timeStart: moment()
          .subtract(1, "d")
          .format("YYYYMMDDHHmmss"),
        timeEnd: moment().format("YYYYMMDDHHmmss"),
        keyword: this.data.identityNo,
        image: "",
        offset: 1,
        limit: 15
      };
      this.pickerValue = [moment().subtract(1, "d"), moment()];
      this.$refs.pictureSearch.reset();
    },
    // 同行分析提交
    onSubmit() {
      this.listTableLoading = true;
      getTogetherGroupList(this.listQuery)
        .then(res => {
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

          this.listTableData = res.data;
        })
        .finally(() => {
          this.listTableLoading = false;
        });
    },
    onListPaging(val) {
      this.listQuery.offset = val;
      this.onSubmit();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.onSubmit();
    },
    // 查看大图
    onLookPicture(img) {
      this.rowBgImg = img;
      this.isBgDialog = true;
    }
  }
};
</script>
<style lang="scss" scoped>
.together-group-data {
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
    .picture-search {
      width: 180px;
    }
    .el-button {
      margin-left: 0;
    }
  }
  .main {
    position: absolute;
    top: 52px;
    right: 0;
    bottom: 0;
    left: 0;
  }
  .table {
    span {
      color: #b1b7bf;
    }
  }
  .img-show {
    margin: 0 auto;
    overflow: hidden;
    border-radius: 4px;
  }
  .identity {
    line-height: 140%;
    label {
      font-size: 14px;
    }
    p {
      color: #9da5af;
    }
  }
  .el-pagination {
    padding: 10px;
  }
}

.detail-layer {
  .el-row {
    background: #fafbfd;
    margin-bottom: 4px;
    border-bottom: 1px solid #e5e5e5;
  }
  .label-box {
    display: inline-block;
    height: 22px;
    vertical-align: top;
  }
  .label-item {
    display: inline-block;
    height: 22px;
    line-height: 18px;
    margin: 0 2px;
    padding: 0 3px;
    text-align: center;
    border: 2px #fff solid;
    border-radius: 99px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    vertical-align: top;
    font-size: 12px;
    color: #fff;
  }
  .info {
    padding: 12px 15px;
    &.segmentation {
      border-right: 1px solid #e0e4ea;
    }
    .title {
      line-height: 26px;
      margin-bottom: 4px;
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    .img-show {
      float: left;
      margin-right: 20px;
    }
    .txt {
      height: 16px;
      line-height: 16px;
      &.name {
        height: 26px;
        line-height: 26px;
        font-size: 14px;
        color: #333;
      }
      label {
        font-size: 12px;
        color: #9da5af;
      }
      .svg-icon {
        display: inline-block;
        height: 100%;
        margin-right: 4px;
        vertical-align: top;
        color: #b5c0cd;
      }
    }
  }
  .more {
    position: relative;
    padding: 12px 15px;
    .bg {
      float: left;
      display: block;
      height: 80px;
      margin-right: 20px;
      border-radius: 4px;
    }
    .txt {
      display: flex;
      width: 260px;
      height: 80px;
      justify-content: center;
      flex-direction: column;
      p {
        line-height: 30px;
      }
    }
    .num {
      position: absolute;
      right: 20px;
      bottom: 10px;
      font-size: 12px;
      color: #333;
      b {
        margin-right: 4px;
        font-size: 36px;
        color: #ffc600;
      }
    }
  }
  .swiper-slide {
    width: 80px;
  }
  .pic {
    display: inline-block;
    vertical-align: top;
  }
}
</style>
