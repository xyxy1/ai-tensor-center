<template>
  <el-dialog title="图片列表" class="pic-list" :visible.sync="isPicListDialog" width="600px">
    <div class="swiper-box">
      <!-- swiper -->
      <swiper class="swiper" ref="swiper" :options="swiperOption">
        <swiper-slide v-for="(item,index) in data" :key="index">
          <img-show class="pic" height="140px" txt="暂无头像" base64 :img-src="item.imgShow">
            <div class="mask" v-if="item.snapTime">{{item.snapTime}}</div>
          </img-show>
        </swiper-slide>
        <div class="swiper-pagination" slot="pagination"></div>
      </swiper>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="isPicListDialog = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>
<script>
import "swiper/dist/css/swiper.css";
import { swiper, swiperSlide } from "vue-awesome-swiper";

export default {
  components: {
    swiper,
    swiperSlide
  },
  props: {
    data: Array,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data: () => ({
    isPicListDialog: false,
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
      this.isPicListDialog = val;
    },
    isPicListDialog(val) {
      this.$emit("update:isOpen", val);
    }
  }
};
</script>
<style lang="scss" scoped>
.pic-list {
  .swiper-box {
    position: relative;
    padding: 0 30px;
    .swiper-button-next,
    .swiper-button-prev {
      background-size: 12px 20px;
      width: 12px;
      height: 20px;
      margin-top: -10px;
    }
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
</style>