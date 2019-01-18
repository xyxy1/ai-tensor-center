<template>
  <div :class="className" :style="{height: height, width: width}"></div>
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import { debounce } from "@/utils";
import { getDayLabel } from "@/api/analysis";

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
      pieData: []
    };
  },
  watch: {
    data(val) {
      if (val.length > 0) {
        this.pieData = [];
        val.map(item => {
          this.pieData.push({
            value: item.cnt,
            name: item.labelName
          });
        });
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
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        color: ["#11c7ff", "#de365b", "#ffe400"], // 业，黑，陌
        legend: {
          orient: "vertical",
          left: "1%",
          bottom: "1%",
          data: this.pieData.map(item => item.name),
          textStyle: {
            color: "#fff"
          }
        },
        series: [
          {
            name: "人员类型分布",
            type: "pie",
            radius: ["40%", "60%"],
            center: ["60%", "50%"],
            avoidLabelOverlap: false,
            data: this.pieData
          }
        ]
      });
    }
  }
};
</script>
