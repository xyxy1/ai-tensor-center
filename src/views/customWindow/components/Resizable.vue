<template>
  <div class="resizable">
    <a resizable="tl"></a>
    <a resizable="tr"></a>
    <a resizable="bl"></a>
    <a resizable="br"></a>
  </div>
</template>
<script>
export default {
  props: {
    el: HTMLDivElement,
    data: Object,
    scale: Number
  },
  data() {
    return {
      gestures: null,
      resizable: null,
      initData: {}
    };
  },
  mounted() {
    this.gestures = this.$gestures({
      el: this.el,
      containsEl: this.$el,
      dragstart: this.onDragstart,
      dragmove: this.onDragmove,
      dragend: this.onDragend
    });
  },
  beforeDestroy() {
    this.gestures.destroy();
  },
  methods: {
    onDragstart(ev) {
      this.resizable = ev.target.getAttribute("resizable");
      this.initData = Object.assign({}, this.data);
    },
    onDragmove(ev, initP, moveP) {
      let _xy = [
        parseInt((moveP[0] - initP[0]) / this.scale),
        parseInt((moveP[1] - initP[1]) / this.scale)
      ];
      if (this.resizable) {
        let _json = {};
        switch (this.resizable) {
          case "tl":
            _json = {
              left: parseInt(this.initData.left) + _xy[0] + "px",
              top: parseInt(this.initData.top) + _xy[1] + "px",
              width: parseInt(this.initData.width) - _xy[0] + "px",
              height: parseInt(this.initData.height) - _xy[1] + "px"
            };
            break;
          case "tr":
            _json = {
              top: parseInt(this.initData.top) + _xy[1] + "px",
              width: parseInt(this.initData.width) + _xy[0] + "px",
              height: parseInt(this.initData.height) - _xy[1] + "px"
            };
            break;
          case "bl":
            _json = {
              left: parseInt(this.initData.left) + _xy[0] + "px",
              width: parseInt(this.initData.width) - _xy[0] + "px",
              height: parseInt(this.initData.height) + _xy[1] + "px"
            };
            break;
          case "br":
            _json = {
              width: parseInt(this.initData.width) + _xy[0] + "px",
              height: parseInt(this.initData.height) + _xy[1] + "px"
            };
            break;
        }

        if (parseInt(_json.width) > 0 && parseInt(_json.height) > 0) {
          this.data = Object.assign(this.data, _json);
        }
      } else {
        this.data = Object.assign(this.data, {
          left: parseInt(this.initData.left) + _xy[0] + "px",
          top: parseInt(this.initData.top) + _xy[1] + "px"
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.resizable {
  position: absolute;
  top: 0;
  left: 0;
  display: none;
  width: 100%;
  height: 100%;
  border: 3px #72acef dashed;
  &:hover {
    border-style: solid;
    box-shadow: 0 0 10px #72acef;
  }
  a {
    position: absolute;
    width: 20px;
    height: 20px;
  }
  [resizable="tl"] {
    top: -10px;
    left: -10px;
    border-top: 4px #72acef solid;
    border-left: 4px #72acef solid;
    cursor: nw-resize;
  }
  [resizable="tr"] {
    top: -10px;
    right: -10px;
    border-top: 4px #72acef solid;
    border-right: 4px #72acef solid;
    cursor: ne-resize;
  }
  [resizable="bl"] {
    bottom: -10px;
    left: -10px;
    border-bottom: 4px #72acef solid;
    border-left: 4px #72acef solid;
    cursor: ne-resize;
  }
  [resizable="br"] {
    bottom: -10px;
    right: -10px;
    border-bottom: 4px #72acef solid;
    border-right: 4px #72acef solid;
    cursor: nw-resize;
  }
}
</style>
