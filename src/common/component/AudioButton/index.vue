<template>
  <div class="audio-button" @click="onClickAudio">
    <audio :src="src" class="audio" :autoplay="autoplay" :loop="loop"></audio>
    <svg-icon iconClass="play" v-if="!isPlay"></svg-icon>
    <svg-icon iconClass="pause" v-else></svg-icon>
  </div>
</template>

<script>
export default {
  props: {
    // 音频地址
    src: {
      required: true,
      type: String
    },
    autoplay: {
      default: false,
      type: Boolean
    },
    loop: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      audio: null,
      isPlay: false
    };
  },
  watch: {
    src() {
      this.isPlay = false;
      this.audio.pause();
    }
  },
  mounted() {
    this.audio = this.$el.querySelector(".audio");
    this.audio.addEventListener("ended", () => {
      this.isPlay = false;
    });
  },
  methods: {
    onClickAudio() {
      this.isPlay = !this.isPlay;
      if (this.isPlay) {
        if (this.audio.error) {
          // 提示处理
          this.$notify({
            title: "失败",
            message: "当前音频无法播放",
            type: "error",
            duration: 2000
          });
          this.isPlay = false;
          return;
        }
        this.audio.play();
      } else {
        this.audio.pause();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.audio-button {
  position: relative;
  display: inline-block;
  background: #fff;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 100%;
  border: 2px #42b983 solid;
  vertical-align: top;
  cursor: pointer;
  /deep/ {
    * {
      color: #42b983 !important;
    }
  }
  .svg-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .audio {
    position: relative;
    top: -999px;
    left: -999px;
  }
}
</style>