<template>
  <div class="flip-timer-item" :class="{separator:!flip}">
    <div class="box show" v-if="!flip">
      <div class="head">
        <span>{{value}}</span>
      </div>
      <div class="tail">
        <span>{{value}}</span>
      </div>
    </div>

    <div class="box" :class="{'flip-before': min + index - 1 == oldValue && oldValue != currentValue, 'flip-after': min + index - 1 == currentValue}" v-for="index in max - min + 1" :key="min + index - 1" v-else>
      <div class="head">
        <span>{{min + index - 1}}</span>
      </div>
      <div class="tail">
        <span>{{min + index - 1}}</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "flip-timer-item",
  props: {
    value: {
      type: [String, Number],
      default: 0
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 9
    },
    flip: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    list: [],
    timer: null,
    oldValue: 0,
    currentValue: 0
  }),
  watch: {
    value: {
      handler(val, oldVal) {
        if (!this.flip) return;

        val = parseInt(val);
        oldVal = parseInt(oldVal);

        if (val != oldVal) {
          this.oldValue = oldVal || 0;
        }
        this.flipAnimation(val);
      },
      immediate: true
    }
  },
  beforeDestroy() {
    this.timer && clearTimeout(this.timer);
  },
  methods: {
    flipAnimation(val) {
      // if (val - this.oldValue > 1) {
      //   this.oldValue =
      //     this.currentValue == this.oldValue
      //       ? this.oldValue
      //       : this.oldValue + 1;
      //   this.currentValue = this.oldValue + 1;
      //   this.timer = setTimeout(() => {
      //     this.flipAnimation(val);
      //   }, 600);
      //   return;
      // }

      this.currentValue = val;
    }
  }
};
</script>
<style lang="scss" scoped>
.flip-timer-item {
  position: relative;
  width: 32px;
  height: 48px;
  perspective: 200px;
  transform-style: preserve-3d;
  .box {
    position: absolute;
    width: 100%;
    height: 100%;
    &.show {
      .head {
        transform: rotateX(0deg);
      }
      .tail {
        transform: rotateX(0deg);
      }
    }
    &.flip-before {
      .head {
        animation: flip-head 0.3s linear 0s forwards;
        z-index: 9;
      }
      .tail {
        transform: rotateX(0deg);
      }
    }
    &.flip-after {
      .head {
        transform: rotateX(0deg) !important;
      }
      .tail {
        animation: flip-tail 0.3s linear 0.3s forwards;
        z-index: 9;
      }
    }
  }
  .head,
  .tail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    overflow: hidden;
    transform-origin: bottom;
    transform: rotateX(-90deg);
    span {
      position: relative;
      display: block;
      background: no-repeat url(./assets/images/item-bg.png);
      width: 100%;
      height: 200%;
      line-height: 48px;
      text-align: center;
      font-size: 24px;
      color: #fff;
    }
  }
  .tail {
    top: 24px;
    transform-origin: top;
    transform: rotateX(90deg);
    span {
      top: -24px;
    }
  }
}

@keyframes flip-head {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-90deg);
  }
}
@keyframes flip-tail {
  0% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0deg);
  }
}
</style>

