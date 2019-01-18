<template>
  <el-dialog title="摄像头" class="body0" :visible.sync="isRegionDialog" width="664px">
    <div class="filter-container">
      <span>区域X轴</span>
      <el-input size="mini" class="filter-item" :value="location[0]" readonly />
      <span>区域Y轴</span>
      <el-input size="mini" class="filter-item" :value="location[1]" readonly />
    </div>
    <div class="picture" @click="onChangeLocation" @mousemove="onMove">
      <img :src="picture">
      <div class="move-x" :style="{left:move[0]+'px'}"></div>
      <div class="move-y" :style="{top:move[1]+'px'}"></div>
      <div class="icon" v-for="item in cameraData" :key="item.cameraId" v-if="item.cameraId != id" :style="{left:item.mapPosition.split(',')[0]*zoom+'px', top:item.mapPosition.split(',')[1]*zoom+'px'}"></div>
      <div class="icon current" v-if="location.length" :style="{left:location[0]*zoom+'px', top:location[1]*zoom+'px'}"></div>

      <div class="tip">
        <p><img src="~@/assets/camera/icon2.png" alt=""><span>已有摄像头</span></p>
        <p><img src="~@/assets/camera/icon1.png" alt=""><span>当前摄像头</span></p>
      </div>
    </div>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="onSubmit">确定</el-button>
      <el-button size="mini" @click="isRegionDialog = false">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getSelectData } from "@/api/camera/index";
import { getCommunity } from "@/api/bigData/community";

export default {
  props: {
    id: Number,
    data: String,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  watch: {
    isOpen(val) {
      this.isRegionDialog = val;
    },
    isRegionDialog(val) {
      this.$emit("update:isOpen", val);
    },
    data(val) {
      if (val) {
        this.location = val.split(",");
      }
    },
    id(val) {
      if (val) {
        this.initData();
      }
    }
  },
  created() {
    getCommunity().then(res => {
      if (res.status === 200) {
        this.picture = res.data.realMapUrl;
      }
    });
  },
  data: () => ({
    move: [],
    location: [],
    isRegionDialog: false,
    picture: null,
    zoom: 0.55, // 先设死

    cameraData: []
  }),
  methods: {
    async initData() {
      await getSelectData().then(res => {
        this.cameraData = res.data;
      });
    },
    onMove(ev) {
      this.move = [ev.offsetX, ev.offsetY];
    },
    onChangeLocation(ev) {
      this.location = [
        Math.round(ev.offsetX / this.zoom),
        Math.round(ev.offsetY / this.zoom)
      ];
    },
    onSubmit() {
      this.$emit("update:data", this.location.join(","));
      this.isRegionDialog = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.filter-container {
  padding: 10px;
  .el-input {
    width: 160px;
  }
  span {
    display: inline-block;
    width: 80px;
    line-height: 26px;
    padding-right: 10px;
    vertical-align: top;
    text-align: right;
    font-size: 13px;
    color: #3f4041;
  }
}
.picture {
  position: relative;
  background: #e3e7e9;
  margin: 2px;
  img {
    display: block;
    width: 100%;
  }
  .icon {
    position: absolute;
    background: no-repeat url(~@/assets/camera/icon2.png);
    width: 24px;
    height: 36px;
    margin: -36px 0 0 -12px;
    pointer-events: none;
    z-index: 99;
    &.current {
      background-image: url(~@/assets/camera/icon1.png);
    }
  }
  .move-x {
    position: absolute;
    top: 0;
    bottom: 0;
    background: #fa0d08;
    width: 1px;
    margin-left: -1px;
    pointer-events: none;
  }
  .move-y {
    position: absolute;
    left: 0;
    right: 0;
    background: #fa0d08;
    height: 1px;
    pointer-events: none;
  }
  .tip {
    position: absolute;
    top: 2px;
    right: 2px;
    background: #fff;
    line-height: 22px;
    padding: 4px 10px;
    font-size: 12px;
    color: #666;
    p {
      padding: 2px 0;
    }
    img {
      display: inline-block;
      width: auto;
      height: 22px;
      margin-right: 4px;
      vertical-align: top;
    }
  }
}
</style>
