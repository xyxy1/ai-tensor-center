<template>
  <div class="time-schedule">
    <div class="btn" @click="onPlay">
      <svg-icon :icon-class="!isPlay?'play':'pause'" />
    </div>
    <div class="schedule">
      <div class="start-time">{{startTime}}</div>
      <div class="end-time">{{endTime}}</div>
      <el-slider v-model="currentValue" :step="1" :max="listData.length+1" :format-tooltip="formatTooltip" show-stops :disabled="listData.length<1"></el-slider>
    </div>
    <div class="time">
      <template v-if="currentTime">
        <p>{{moment(currentTime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm:ss')}}</p>
        {{moment(currentTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')}} {{moment(currentTime, 'YYYY-MM-DD HH:mm:ss').format('dddd')}}
      </template>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import "moment/locale/zh-cn";

export default {
  name: "time-schedule",
  props: {
    play: {
      required: true,
      type: Boolean
    },
    listData: {
      required: true,
      type: [Array]
    },
    startTime: {
      // required: true,
      type: [String]
    },
    endTime: {
      // required: true,
      type: [String]
    }
  },
  watch: {
    play(val) {
      this.isPlay = val;
    },
    isPlay(val) {
      if (!val) {
        clearTimeout(this.timer);
      }
      this.$emit("update:play", val);
    },
    listData(newVal) {
      clearTimeout(this.timer);
      this.isPlay = false;
      this.currentValue = newVal.length + 1;
    },
    currentValue(newVal, val) {
      let _val = newVal - 1;
      if (this.changeValue != _val) {
        this.changeValue = _val;
        this.$emit("change", _val);
      }
    }
  },
  data() {
    return {
      moment: moment,
      timer: null, // 计时器
      isPlay: false,
      currentTime: this.startTime, // 当前帧时间
      currentValue: this.listData.length + 1 // 时间轴拖动值
    };
  },
  methods: {
    onPlay() {
      this.isPlay = !this.isPlay;
      if (this.isPlay) {
        // 重新播放
        this.currentValue =
          this.currentValue === this.listData.length + 1
            ? 0
            : this.currentValue;
        // 开始计时播放
        this.startPlay();
      } else {
        clearTimeout(this.timer);
      }
    },
    startPlay() {
      this.timer = setTimeout(() => {
        this.currentValue++;

        if (this.currentValue === this.listData.length + 1) {
          this.isPlay = false;
          return;
        }
        this.startPlay();
      }, 1000);
    },
    rangeInDefined(current, min, max) {
      if (current < min) {
        return min;
      } else if (current > max) {
        return max;
      } else {
        return current;
      }
    },
    formatTooltip(val) {
      let _time = this.listData[val - 1]
        ? this.listData[val - 1].imgTime
        : null;
      if (_time) {
        this.currentTime = _time;
      } else {
        this.currentTime = val == 0 ? this.startTime : this.endTime;
      }

      return this.currentTime;
    }
  }
};
</script>