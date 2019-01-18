<template>
  <div class="img-show" :style="{width: width, height: height, fontSize: size}">
    <div class="null" v-if="!imgSrc">{{txt}}</div>
    <img v-else :src="base64?'data:image/jpeg;base64,' + imgSrc:imgSrc" :style="{width:width=='auto'?'atuo':'100%',height:height=='auto'?'atuo':'100%'}" />
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    imgSrc: {
      default: "",
      type: String
    },
    base64: {
      default: false,
      type: Boolean
    },
    txt: {
      default: "暂无图片",
      type: String
    },
    size: {
      default: "12px",
      type: String
    },
    width: {
      default: "auto",
      type: String
    },
    height: {
      default: "auto",
      type: String
    }
  }
};
</script>

<style lang="scss" scoped>
.img-show {
  position: relative;
  background: #ccc;
  .null {
    position: absolute;
    top: 50%;
    left: 50%;
    line-height: 120%;
    transform: translate(-50%, -50%);
  }
  img {
    display: block;
  }
}
</style>
