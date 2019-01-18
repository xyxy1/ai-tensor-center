<template>
    <div class="container">
        <span @click="toggleModal">
          <slot></slot>
        </span>
        <el-dialog :title="title" :visible="showModal" width="60%" @close="handleModalClose">
            <el-date-picker
              v-model="timeRange"
              class="time-range"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
              @change="handleTimeChange">
            </el-date-picker>
            <el-row v-if="!data.length || data.length==0">
              <el-col>
                <div class="empty-info">没有数据</div>
              </el-col>
            </el-row>
            <el-row v-else>
                <el-col :span="4" v-for="(item, index) in data" :key="index" style="padding: 8px">
                    <el-card :body-style="{ padding: '0px' }">
                        <image-list-modal :id="item.identityNo">
                            <img :src="'data:text/html;base64,'+item.imgBase" class="inner-image">
                        </image-list-modal>
                        <div style="padding: 14px;">
                            <span>{{item.cameraId}} {{item.cameraName}}</span>
                            <div class="bottom clearfix">
                                <time class="time">{{timeFormat(item.imgTime)}}</time>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <div class="block">
                <el-pagination
                    layout="prev, pager, next"
                    :current-page="page"
                    :page-size="size"
                    :total="total"
                    @current-change="handlePageChange">
                </el-pagination>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { parseTime } from "@/utils/index";

export default {
  name: "ImageListModal",
  props: ["id"],
  data() {
    return {
      showModal: false,
      formData: {},
      title: "人脸抓拍",
      timeRange: [],
      timeStart: 20180630000000,
      timeEnd: 20180704000000,
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      }
    };
  },
  methods: {
    toggleModal() {
      this.showModal = !this.showModal;
      if (this.showModal) {
        this.$store.dispatch("cluster/fetchCategoryList", {
          page: this.page,
          identityNo: this.id,
          timeStart: this.timeStart,
          timeEnd: this.timeEnd
        });
      }
    },
    handleModalClose() {
      this.showModal = false;
    },
    handlePageChange(page) {
      this.$store.dispatch("cluster/fetchCategoryList", {
        page,
        identityNo: this.id,
        timeStart: this.timeStart,
        timeEnd: this.timeEnd
      });
    },
    handleTimeChange(value) {
      let timeStart = this.timeFormat(value[0]).replace(/-/g, '').replace(/:/g, '').replace(/\s/g, '');
      this.timeStart = timeStart;
      let timeEnd = this.timeFormat(value[1]).replace(/-/g, '').replace(/:/g, '').replace(/\s/g, '');
      this.timeEnd = timeEnd;
      this.$store.dispatch("cluster/fetchCategoryList", {
        page: 1,
        identityNo: this.id,
        timeStart: this.timeStart,
        timeEnd: this.timeEnd
      });
    },
    timeFormat(timeStamp) {
      return parseTime(timeStamp);
    }
  },
  computed: {
    ...mapState({
      data: state => state.cluster.categoryListData.data,
      page: state => state.cluster.categoryListData.page,
      size: state => state.cluster.categoryListData.size,
      total: state => state.cluster.categoryListData.total
    })
  }
};
</script>

<style lang="scss" scoped>
.block {
  text-align: center;
}

.time-range {
  margin-bottom: 10px;
}

.empty-info {
  padding: 30px 0;
  text-align: center;
  font-size: 18px;
  color: gray;
}

.image {
  width: 100%;
}

.inner-image {
  width: 100%;
  height: 167px;
  background-size: cover;
  background-position: 50% 0;
  background-repeat: no-repeat;
}
</style>

