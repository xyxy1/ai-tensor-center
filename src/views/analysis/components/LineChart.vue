<template>
  <div :class="className" :style="{height: height, width: width}"></div>
</template>

<script>
import moment from "moment";
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import { debounce } from "@/utils";

export default {
  props: {
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
    },
    data: Array
  },
  data() {
    return {
      chart: null,
      timer: null,
      lineData: []
    };
  },
  watch: {
    data(val) {
      if (val.length > 0) {
        this.lineData = [];
        this.lineData = val;
        this.$nextTick(() => {
          this.initChart();
        });
      }
    }
  },
  mounted() {
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

    clearTimeout(this.timer);
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el);

      this.chart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6bbedc"
            }
          }
        },
        color: ["#00cdf6"],
        textStyle: {
          color: "#fff"
        },
        grid: {
          top: "14%",
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            data: this.lineData.map(
              item =>
                `${item.daydate.slice(4, 6)}月${item.daydate.slice(6, 8)}日`
            ),
            axisLine: {
              lineStyle: {
                color: "rgba(255,255,255,0)"
              }
            }
          }
        ],
        yAxis: [
          {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "rgba(255,255,255,0.2)"
              }
            },
            splitLine: {
              lineStyle: {
                color: "rgba(255,255,255,0.2)"
              }
            }
          }
        ],
        series: [
          {
            name: "采集数",
            type: "line",
            areaStyle: {
              normal: {
                color: "rgba(0, 205, 246, 0.3)"
              }
            },
            data: this.lineData.map(item => item.cnt)
          }
        ]
      });
    }
  }
};
</script>
