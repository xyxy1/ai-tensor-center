<template>
  <div :style="{height: height, width: width}"></div>
</template>

<script>
import moment from "moment";
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import { debounce } from "@/utils";

export default {
  props: {
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
      lineData: null
    };
  },
  watch: {
    data: {
      immediate: true,
      handler(val) {
        if (val.length) {
          let _alarm = [];
          val[1].map((item, index) => {
            if (item[1] > 0) {
              _alarm.push(val[0][index].concat([item[1]]));
            } else {
              _alarm.push([item[0]]);
            }
          });

          this.lineData = [val[0], _alarm];
          this.$nextTick(() => {
            this.initChart();
          });
        }
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
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el);

      this.chart.setOption({
        title: {
          text: "● 今日人流量（含预警）",
          left: "1%",
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: "axis",
          formatter: function(arr) {
            return `
              ${arr[0].name}
              <br/>
              ${arr[0].marker}${arr[0].seriesName}：${arr[0].data[1]}
              <br/>
              ${arr[1].marker}${arr[1].seriesName}：${arr[1].data[2] || 0}`;
          }
        },
        color: ["#0aa4ea", "#fd0a02", "#fd0a02"],
        grid: {
          top: "24%",
          left: "1%",
          right: "2%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          axisPointer: {
            lineStyle: { opacity: 0.4, width: 2 },
            label: { show: true },
            handle: { show: false }
          },
          splitLine: { show: false }
        },
        yAxis: { type: "value" },
        series: [
          {
            name: "人数",
            type: "line",
            data: this.lineData[0],
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "#91d8f9" },
                  { offset: 1, color: "#e5f4fc" }
                ])
              }
            }
          },
          {
            name: "预警",
            type: "bar",
            data: this.lineData[1],
            barWidth: 1
          },
          {
            type: "scatter",
            symbolSize: 6,
            data: this.lineData[1]
          }
        ]
      });
    }
  }
};
</script>
