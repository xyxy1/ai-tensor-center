<template>
  <el-col :span="5" class="label-library">
    <div class="title">
      <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText" clearable></el-input>
    </div>
    <ul v-if="menuData" class="menu">
      <li class="menu-item" v-if="item.label.includes(filterText)" v-for="(item,index) in menuData" :key="item.terminalId" :class="{sel: currentRow.terminalId == item.terminalId}" @click="onUpdataMenu(item,index)">
        <el-tooltip :content="''+ item.labelDesc" :open-delay="400" placement="right">
          <div class="box">
            <svg-icon icon-class="server" />
            <span>{{item.label}}</span>
            <div class="total">{{item.count}}</div>
          </div>
        </el-tooltip>
      </li>
    </ul>
  </el-col>
</template>
<script>
import { getLabelLibraryList } from "@/api/faceModule/faceLabel/index";

export default {
  name: "labelLibrary",
  data: () => ({
    filterText: "",
    menuData: null,
    currentRow: null,
    currentIndex: 0
  }),
  watch: {
    menuData(val) {
      if (this.menuData) {
        this.currentRow = this.menuData[this.currentIndex];
        this.$emit("change", this.currentRow);
      }
    }
  },
  created() {
    this.menuList();
  },
  methods: {
    menuList() {
      this.$store.dispatch("camera/tree").then(res => {
        this.menuData = res.data.rows;
      });
    },
    onUpdataMenu(row, index) {
      this.currentRow = row;
      this.currentIndex = index;

      this.$emit("change", this.currentRow);
    }
  }
};
</script>
<style lang="scss" scoped>
.label-library {
  background: #fafbfd;
  border-right: 1px solid #e1e1e1;
  .title {
    height: 46px;
    line-height: 46px;
    padding: 0 10px 0 16px;
    font-size: 14px;
    color: #333;
    .el-button {
      float: right;
      margin-top: 10px;
    }
  }
  .menu {
    padding: 0 6px;
    border-top: 1px solid #e1e1e1;
    font-size: 13px;
    color: #333;
  }
  .menu-item {
    position: relative;
    padding: 0 10px;
    cursor: pointer;
    &:hover {
      background: #e7eff8;
    }
    &.sel {
      background: #d5e6f9;
      .more {
        display: block !important;
      }
    }
    .more {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      display: none !important;
      .icon {
        display: inline-block;
        height: 100%;
      }
    }
    .box {
      height: 39px;
      line-height: 38px;
      padding: 0 6px;
      border-bottom: 1px solid #edeff3;
    }
    span {
      display: inline-block;
      margin-left: 6px;
      vertical-align: top;
    }
    .svg-icon {
      display: inline-block;
      height: 100%;
      vertical-align: top;
      font-size: 16px;
      color: #b5c0cd;
    }
    .total {
      float: right;
      color: #878c8f;
    }
  }
}
</style>


