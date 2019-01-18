<template>
  <div :style="{height: height, width: width}"></div>
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import { debounce } from "@/utils";
import { getDayLabel } from "@/api/analysis";

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
      timer: null,
      pieData: [],
      colorArr: []
    };
  },
  watch: {
    data: {
      immediate: true,
      handler(val) {
        if (val.length > 0) {
          this.pieData = [];
          val.map(item => {
            this.pieData.push({
              value: item.count,
              name: item.name
            });
          });
          this.colorArr = val.map(item => item.color);

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

    clearTimeout(this.timer);
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el);

      this.chart.setOption({
        title: {
          text: "● 人员类型分布",
          top: "8px",
          left: "6px",
          textStyle: {
            fontSize: 14,
            fontWeight: "lighter"
          }
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {d}%"
        },
        color: this.colorArr,
        legend: {
          bottom: "8px",
          data: this.pieData.map(item => item.name),
          textStyle: {
            color: "#898e91"
          }
        },
        series: [
          {
            name: "人员类型分布",
            type: "pie",
            radius: ["40%", "60%"],
            center: ["50%", "45%"],
            avoidLabelOverlap: false,
            data: this.pieData
          }
        ]
      });
    }
  }
};
</script>
