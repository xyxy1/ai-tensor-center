<template>
  <el-dialog title="布控详情" class="task-details body0" :visible.sync="isDetailsDialog" width="1000px">
    <el-row class="info">
      <el-col :span="8">
        <div class="item">
          <span>任务编号：</span>
          <div class="txt">{{detailsData.code}}</div>
        </div>
        <div class="item">
          <span>任务名称：</span>
          <div class="txt">{{detailsData.name}}</div>
        </div>
        <div class="item">
          <span>负责人：</span>
          <div class="txt" v-if="detailsData.leaders">{{detailsData.leaders.map(item => item.name).join('，')}}</div>
        </div>
        <div class="item">
          <span>布控状态：</span>
          <div class="txt" :class="{col1:detailsData.status=='1', col2:detailsData.status=='0'}">{{detailsData.status=='1'?'在控':'撤控'}}</div>
        </div>
        <div class="item">
          <span>任务描述：</span>
          <div class="txt">{{detailsData.remark}}</div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="item">
          <span>布控时间：</span>
          <div class="txt">
            <template v-if="detailsData.timeFlag == '0'">长期有效</template>
            <template v-else>
              {{detailsData.timeStart}} 至 {{detailsData.timeEnd}}
            </template>
          </div>
        </div>
        <div class="item">
          <span>布控区域：</span>
          <div class="txt" v-if="detailsData.areas">{{detailsData.areas.map(item => item.name).join('，')}}</div>
        </div>
        <div class="item">
          <span>布控库：</span>
          <div class="txt" v-if="detailsData.libraries">{{detailsData.libraries.map(item => item.name).join('，')}}</div>
        </div>
        <div class="item">
          <span>布控个体：</span>
          <div class="swiper-box" v-if="detailsData.labels && detailsData.labels.length">
            <!-- swiper -->
            <swiper class="swiper" ref="swiper" :options="swiperOption">
              <swiper-slide v-for="(item,index) in detailsData.labels" :key="index">
                <img-show class="pic" width="60px" height="60px" txt="暂无头像" :img-src="item.identityImg">
                  <div class="mask" v-if="item.name">{{item.name}}</div>
                </img-show>
              </swiper-slide>
              <div class="swiper-pagination" slot="pagination"></div>
            </swiper>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        告警消息
        <em>{{listTableData.total?listTableData.total:0}}</em>
      </div>
    </div>
    <!-- 表格模式 S -->
    <el-table ref="listTabel" :data="listTableData.rows" height="calc(100vh - 520px)" v-loading.body="listTableLoading" highlight-current-row>
      <el-table-column label="序号" align="center" type="index" width="50" />
      <el-table-column label="抓拍照片" align="center" width="80">
        <template slot-scope="scope">
          <img-show class="pic" width="48px" height="48px" text="暂无照片" base64 :img-src="scope.row.snapImg" />
        </template>
      </el-table-column>
      <el-table-column label="相似度" align="center" width="70">
        <template slot-scope="scope">{{scope.row.similarity}}%</template>
      </el-table-column>
      <el-table-column label="证件照片" align="center" width="80">
        <template slot-scope="scope">
          <img-show class="pic" width="48px" height="48px" text="暂无照片" :img-src="scope.row.identityImgUrl" />
        </template>
      </el-table-column>
      <el-table-column label="背景图" align="center" width="120">
        <template slot-scope="scope">
          <a @click="onLookPicture(scope.row.snapBgImgUrl)">
            <img-show height="48px" txt="暂无背景" :img-src="scope.row.snapBgImgUrl" class="bg-pic" />
          </a>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名/证件号" width="180px">
        <template slot-scope="scope">
          <div class="identity txt">
            <label>{{scope.row.name}}</label>
            <p>{{scope.row.identityNo}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类别" align="center" min-width="120px">
        <template slot-scope="scope">
          <div class="label-box">
            <span class="label-item" v-if="scope.row.labelNames" v-for="(label,index) in scope.row.labelNames.split(',')" :key="index" :style="{backgroundColor:label.split('|')[1],color:colorBrightness(label.split('|')[1])}">{{label.split('|')[0]}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="cameraName" label="摄像头" />
      <el-table-column prop="snapTime" min-width="160" label="抓拍时间" />
    </el-table>
    <!-- 表格模式 E -->
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total"></el-pagination>

    <div slot="footer">
      <el-button size="mini" type="primary" @click="isDetailsDialog = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import moment from "moment";
import "swiper/dist/css/swiper.css";
import { swiper, swiperSlide } from "vue-awesome-swiper";

import { getMonitorTask } from "@/api/bigData/monitorTask";
import { postAlarmList } from "@/api/bigData/alarmNews";

export default {
  components: {
    swiper,
    swiperSlide
  },
  props: {
    id: Number,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data: () => ({
    isDetailsDialog: false,
    detailsData: {},

    listQuery: {
      timeStart: "20180101000000",
      monitorIds: null,
      offset: 1,
      limit: 15
    },
    listTableData: {},
    listTableLoading: false,

    swiperOption: {
      slidesPerView: "auto",
      spaceBetween: 5,
      freeMode: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      }
    }
  }),
  watch: {
    isOpen(val) {
      this.isDetailsDialog = val;
    },
    isDetailsDialog(val) {
      if (val) {
        this.detailsData = {};
        this.listQuery = {
          timeStart: "20180101000000",
          monitorIds: null,
          offset: 1,
          limit: 15
        };
        this.listTableLoading = false;
        this.listTableData = {};

        this.initData();
      }

      this.$emit("update:isOpen", val);
    }
  },
  methods: {
    initData() {
      this.listQuery.monitorIds = this.id;
      getMonitorTask(this.id).then(res => {
        if (res.status == 200) {
          this.detailsData = res.data;
        }
      });
      this.getTableList();
    },
    getTableList() {
      postAlarmList(this.listQuery)
        .then(res => {
          this.listTableData = res.data;
        })
        .finally(() => {
          this.listTableLoading = false;
        });
    },
    // 分页更新
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getTableList();
    },
    // 分页更新
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    }
  }
};
</script>
<style lang="scss" scoped>
.task-details {
  .col1 {
    color: #fa0610;
  }
  .col2 {
    color: #4dd861;
  }

  .swiper-box {
    position: relative;
    background: #e8e8e8;
    margin-left: 90px;
    padding: 10px 30px;
    border-radius: 8px;
    .swiper-button-next,
    .swiper-button-prev {
      background-size: 12px 20px;
      width: 12px;
      height: 20px;
      margin-top: -10px;
    }
    .swiper-pagination {
      bottom: 0;
      line-height: 10px;
    }
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
  }

  .info {
    background: #fafbfd;
    padding: 20px;
    font-size: 13px;
    color: #3f4041;
    .item {
      line-height: 26px;
      overflow: hidden;
    }
    span {
      float: left;
      width: 90px;
      padding-right: 6px;
      text-align: right;
      color: #999;
    }
    .txt {
      margin-left: 90px;
    }
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
  .el-pagination {
    padding: 10px;
  }
}
</style>