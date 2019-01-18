<template>
  <div :class="className" :style="{height: height, width: width}"></div>
</template>

<script>
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
      barData: []
    };
  },
  watch: {
    data(val) {
      if (val.length > 0) {
        this.barData = [];
        this.barData = val;
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
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
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
            data: this.barData.map(
              item =>
                `${item.day.slice(4, 6)}月${item.day.slice(6, 8)}日`
            ),
            axisTick: {
              alignWithLabel: true
            },
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
            name: "车次",
            type: "bar",
            barWidth: "60%",
            data: this.barData.map(item => item.num)
          }
        ]
      });
    }
  }
};
</script>
