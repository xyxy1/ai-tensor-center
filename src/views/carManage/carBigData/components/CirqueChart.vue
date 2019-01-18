<template>
  <div :class="className" :style="{height: height, width: width}"></div>
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import { debounce } from "@/utils";

export default {
  props: {
    data: {
      type: String,
      default: 0
    },
    className: {
      type: String,
      default: "chart"
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "100%"
    }
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    data(val) {
      this.initChart();
    }
  },
  mounted() {
    this.initChart();
    this.__resizeHanlder = debounce(() => {
      if (this.chart) {
        this.chart.resize();
      }
    }, 100);
    window.addEventListener("resize", this.__resizeHanlder);
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    window.removeEventListener("resize", this.__resizeHanlder);
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el);

      this.chart.setOption({
        tooltip: {
          show: false
        },
        color: ["#f89535", "#9d3434"],
        series: [
          {
            type: "pie",
            radius: ["55%", "80%"],
            avoidLabelOverlap: false,
            hoverAnimation: false,
            label: {
              normal: {
                show: false,
                position: "center",
                textStyle: {
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#fff"
                },
                formatter: "{c}%"
              }
            },
            data: [
              {
                value: this.data,
                label: {
                  normal: {
                    show: true
                  }
                }
              },
              {
                value: 100 - this.data
              }
            ]
          }
        ]
      });
    }
  }
};
</script>
