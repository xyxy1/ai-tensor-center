<template>
  <div class="app-container">
    <!-- 表单筛选 -->
    <el-form class="form" @keyup.enter.native="onSearch">
      <span>关键字</span>
      <picture-search ref="pictureSearch" size="mini" placeholder="名称/证件号" @change="onSearchChange"></picture-search>
      <span>时间</span>
      <el-date-picker size="mini" v-model="pickerValue" type="datetimerange" :picker-options="pickerOptions" range-separator="|" @change="onPickerChange" start-placeholder="开始日期" end-placeholder="结束日期" align="center" :clearable="false" :editable="false">
      </el-date-picker>
      <el-button size="mini" type="primary" @click="onSearch">开始分析</el-button>
      <el-button size="mini" @click="onReset">重置</el-button>
    </el-form>

    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        同行组分析
        <em>{{listTableData.total?listTableData.total:0}}</em>
      </div>
    </div>

    <!-- 数据展示 -->
    <el-table :data="listTableData.rows" class="table" v-loading="listTableLoading" height="calc(100vh - 255px)">
      <el-table-column align="center" label="同行人员" width="300">
        <template slot-scope="scope">
          <!-- swiper -->
          <swiper class="swiper" ref="swiper" :options="swiperOption">
            <swiper-slide v-for="(item,index) in scope.row.persons" :key="index">
              <img-show class="pic" height="60px" txt="暂无头像" :img-src="item.identityUrl">
                <div class="mask" v-if="item.name">{{item.name}}</div>
              </img-show>
            </swiper-slide>
            <div class="swiper-pagination" slot="pagination"></div>
          </swiper>
        </template>
      </el-table-column>
      <el-table-column prop="num" label="同行人数" width="100" align="center">
        <template slot-scope="scope">
          {{scope.row.num}}人
        </template>
      </el-table-column>
      <el-table-column prop="togetherAddr" label="同行地址" align="center"></el-table-column>
      <el-table-column prop="togetherTime" label="同行时间" align="center"></el-table-column>
      <el-table-column label="操作" fixed="right" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="onDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,100,250]" :page-size="listQuery.limit" :total="listTableData.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>

    <!-- 同行详情 -->
    <el-dialog title="同行详情" class="detail-layer body0" :visible.sync="isDialogDateil" width="800px">
      <el-row>
        <el-col :span="22" class="info">
          抓拍地址：{{detailData.togetherAddr}}
        </el-col>
        <el-col :span="2" class="num" v-if="detailData.records"><b>{{detailData.records.length}}</b>人</el-col>
      </el-row>
      <el-table :data="detailData.records" class="table" height="calc(100vh - 180px)" max-height="600px">
        <el-table-column align="center" label="同行抓拍" width="80">
          <template slot-scope="scope">
            <img-show width="48px" height="48px" txt="暂无头像" :img-src="scope.row.snapImgBase" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="同行背景图">
          <template slot-scope="scope">
            <a @click="onLookPicture(scope.row.snapBgUrl)">
              <img-show height="48px" txt="暂无背景" :img-src="scope.row.snapBgUrl" class="pic" />
            </a>
          </template>
        </el-table-column>
        <el-table-column label="同行人姓名/证件号" width="180px">
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
        <el-button size="mini" type="primary" @click="isDialogDateil=false">关 闭</el-button>
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
  getTogetherGroupArrayList,
  getTogetherGroupArrayDetail
} from "@/api/togetherGroup";

import "swiper/dist/css/swiper.css";
import { swiper, swiperSlide } from "vue-awesome-swiper";

export default {
  name: "togetherGroupArray",
  components: {
    swiper,
    swiperSlide
  },
  data() {
    return {
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
      pickerOptions: pickerOptions,

      isBgDialog: false, // 控制背景图显示
      rowBgImg: null,

      swiperOption: {
        slidesPerView: "auto",
        spaceBetween: 5,
        freeMode: true
      }
    };
  },
  created() {
    this.onSubmit();
  },
  methods: {
    // 日期选择器变更
    onPickerChange(date) {
      if (!date) return;
      this.listQuery.timeStart = moment(date[0]).format("YYYYMMDDHHmmss");
      this.listQuery.timeEnd = moment(date[1]).format("YYYYMMDDHHmmss");
    },
    onSearchChange(val, img) {
      this.listQuery.keyword = val || "";
      this.listQuery.image = img || "";
    },
    onDetail(row) {
      getTogetherGroupArrayDetail({
        groupId: row.id
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
        keyword: "",
        image: "",
        offset: 1,
        limit: 15
      };
      this.pickerValue = [moment().subtract(1, "d"), moment()];
      this.$refs.pictureSearch.reset();
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.listQuery.limit = 15;
      this.onSubmit();
    },
    // 同行分析提交
    onSubmit() {
      this.listTableLoading = true;
      getTogetherGroupArrayList(this.listQuery)
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
.app-container {
  position: relative;
  height: 100%;
  .w100 {
    width: 100%;
  }
  .form {
    background: #fafbfd;
    height: 46px;
    line-height: 46px;
    overflow: hidden;
    font-size: 0;
    & > * {
      margin-right: 6px;
    }
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
    .swiper-slide {
      float: left;
      width: auto;
    }
    .pic {
      position: relative;
      display: inline-block;
      overflow: hidden;
      vertical-align: top;
      border-radius: 6px;
      .mask {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.4);
        line-height: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        font-size: 12px;
        color: #fff;
      }
    }
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
    padding: 20px 0 20px 20px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }
  .num {
    padding-top: 10px;
    font-size: 12px;
    color: #333;
    b {
      margin-right: 4px;
      font-size: 36px;
      color: #ffc600;
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