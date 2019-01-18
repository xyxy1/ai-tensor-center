<template>
  <div :class="className" :style="styles"></div>
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
    styles: {
      type: Object,
      default: () => {
        return {
          width: "100%",
          height: "100%"
        };
      }
    },
    sky: Number
  },
  data() {
    return {
      chart: null,
      pieData: [
        {
          value: 20,
          name: "业主"
        },
        {
          value: 1,
          name: "黑名单"
        },
        {
          value: 5,
          name: "陌生人"
        }
      ]
    };
  },
  watch: {
    styles: {
      handler(val, oldVal) {
        this.$nextTick(() => {
          if (this.chart) {
            this.chart.setOption({
              series: [
                {
                  center: [
                    Math.min(
                      66,
                      Math.max(50, (200 / parseInt(this.styles.width)) * 100)
                    ) + "%",
                    "50%"
                  ]
                }
              ]
            });
            this.chart.resize();
          }
        });
      },
      deep: true
    }
  },
  mounted() {
    this.__resizeHanlder = debounce(() => {
      this.chart && this.chart.resize();
    }, 100);
    window.addEventListener("resize", this.__resizeHanlder);

    this.initChart();
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
            radius: ["30%", "50%"],
            center: [
              Math.min(
                66,
                Math.max(50, (200 / parseInt(this.styles.width)) * 100)
              ) + "%",
              "50%"
            ],
            data: this.pieData
          }
        ]
      });
    }
  }
};
</script>