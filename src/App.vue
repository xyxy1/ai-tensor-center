<template>
  <div id="app">
    <router-view></router-view>

    <!-- 处理弹窗 -->
    <dispose-layer :is-open.sync="isDisposeDialog" :data="disposeData" />
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { getToken } from "@/utils/auth";

export default {
  name: "app",
  components: {
    DisposeLayer: () =>
      import("@/views/bigData/alarmNews/components/DisposeLayer")
  },
  data() {
    return {
      ip:
        process.env.NODE_ENV === "development" ? process.env.IP : location.host,
      notifyList: [],

      isDisposeDialog: false,
      disposeData: null,

      isDestroy: false,
      webSocket: null
    };
  },
  computed: {
    ...mapGetters(["alarmSwitch"])
  },
  watch: {
    alarmSwitch(val) {
      // 判断预警是否开启
      if (val) {
        this.isDestroy = false;
        this.initWebSocket();
      } else {
        this.isDestroy = true;
        this.webSocket && this.webSocket.close();
        // 清空之前预警
        this.notifyList.map(item => {
          item.close();
        });
        this.notifyList = [];
      }
    }
  },
  methods: {
    initWebSocket() {
      let _this = this;
      this.webSocket = new WebSocket(
        `ws://${this.ip}/websocket/push/${getToken()}`
      );
      //打开事件
      this.webSocket.onopen = () => {
        console.log("预警监听开启");
      };
      //获得消息事件
      this.webSocket.onmessage = msg => {
        try {
          let _data = JSON.parse(msg.data);

          if (typeof _data === "object" && _data.code == 5) {
            let _json = JSON.parse(_data.message);

            // 更新警报总数
            this.$store.dispatch("SetAlarmTotal", _json.unHandleCnt);

            if (_json.alarmDetail) {
              // 最多显示三个
              if (this.notifyList.length == 3) {
                this.notifyList.splice(0, 1)[0].close();
              }

              this.notifyList.push(
                this.$notify({
                  type: "warning",
                  dangerouslyUseHTMLString: true,
                  customClass: "monitor-notify",
                  message: `“${_json.alarmDetail.monitorName}”有新的布控预警`,
                  position: "bottom-right",
                  duration: 0,
                  onClick() {
                    this.close();
                    _this.disposeData = _json.alarmDetail;
                    _this.isDisposeDialog = true;
                  }
                })
              );
            }
          }
        } catch (err) {}
      };
      //关闭事件
      this.webSocket.onclose = () => {
        if (!this.isDestroy) {
          this.webSocket = null;
          setTimeout(() => {
            this.initWebSocket();
          }, 1000);
        }
      };
    }
  }
};
</script>