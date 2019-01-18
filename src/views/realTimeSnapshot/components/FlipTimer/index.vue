<template>
  <div class="flip-timer">
    <!-- 时间专属 -->
    <item v-if="type === 'date'" v-for="(item,index) in itemList" :key="index" :value="item" :flip="!isNaN(parseInt(item))" />

    <!-- 数字专属 -->
    <item v-if="type === 'number'" v-for="item in itemList" :key="item.key" :value="item.value" />
  </div>
</template>
<script>
import moment from "moment";

export default {
  name: "flip-timer",
  props: {
    type: {
      type: String,
      default: "number"
    },
    value: {
      type: Number,
      default: 0
    }
  },
  data: () => ({
    timer: null,
    itemList: []
  }),
  watch: {
    value(val, oldVal) {
      let _time = new Date().getTime(); // 时间戳，唯一标识
      let _newArr = val.toString().split("");
      let _length = this.itemList.length;

      _newArr.map((item, index) => {
        if (index < _newArr.length - _length) {
          this.itemList.splice(index, 0, {
            key: _time + index,
            value: item
          });
        } else {
          this.$set(this.itemList[index], "value", item);
        }
      });
    }
  },
  components: {
    item: () => import("./item")
  },
  created() {
    this.type == "date" && this.initDate();
    this.type == "number" && this.initNumber();
  },
  beforeDestroy() {
    this.timer && clearTimeout(this.timer);
  },
  methods: {
    initDate() {
      this.itemList = moment()
        .format("HH:mm:ss")
        .split("");
      this.timer = setTimeout(() => {
        this.initDate();
      }, 1000);
    },
    initNumber() {
      let _time = new Date().getTime(); // 时间戳，唯一标识
      this.itemList = this.value
        .toString()
        .split("")
        .map((item, index) => {
          return { key: _time + index, value: item };
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.flip-timer {
  .flip-timer-item {
    float: left;
    margin-left: 4px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  }
}
</style>

