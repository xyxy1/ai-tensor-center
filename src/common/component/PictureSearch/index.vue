<template>
  <div class="picture-search" :class="size">
    <div class="prepend" v-show="image">
      <img :src="image.includes('.')?image:'data:image/jpeg;base64,'+image">
      <div class="close" @click="onEmpty">
        <i class="el-icon-close"></i>
      </div>
    </div>
    <el-input ref="input" :size="size" :placeholder="placeholder" v-model="value" :class="{image:image}" />
    <i class="el-icon-error clearable" :class="size" v-show="image || value" @click="reset"></i>
    <div class="append">
      <el-upload class="upload" action="" accept=".jpeg,.jpg,.png,.bmp" :auto-upload="false" :show-file-list="false" :on-change="onUpload">
        <i class="el-icon-picture" :class="size"></i>
      </el-upload>
    </div>
    <div class="search-list" :style="{top:$el.clientHeight+'px', width:$el.clientWidth+'px'}" v-if="init && async" v-show="listShow && asyncData.length">
      <div class="box">
        <div class="scroll">
          <ul>
            <li v-for="item in asyncData" :key="item.id" @click="onItemChange(item)">
              <img :src="'data:image/jpeg;base64,'+item.identityImg" class="pic">
              <div class="name">
                {{ item.name }}
                <div class="label-box">
                  <span class="label-item" v-for="(item,index) in item.shortNames.split(',')" :key="index" :style="{backgroundColor:item.split('|')[1],color:colorBrightness(item.split('|')[1])}">{{item.split('|')[0]}}</span>
                </div>
              </div>
              <div class="txt">{{ item.identityNo }}</div>
              <div class="tip">查看</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { getBase64 } from "@/utils";
import { postLabelSearch } from "@/api/allSearch";

export default {
  props: {
    size: {
      default: "medium",
      type: String
    },
    async: {
      default: false,
      type: Boolean
    },
    placeholder: String
  },
  data: () => ({
    init: false,
    value: "",
    image: "",
    asyncData: [],
    isAsync: false,
    listShow: false
  }),
  computed: {
    ...mapGetters({
      allSearchData: "allSearch/getData"
    })
  },
  mounted() {
    this.init = true;

    // 默认处理关闭搜索列表
    document.body.addEventListener("click", () => {
      if (this.listShow) {
        this.listShow = false;
      }
    });
  },
  watch: {
    image(val) {
      this.$emit("change", this.value, this.image);
    },
    value(val) {
      this.$emit("change", this.value, this.image);
    },
    allSearchData(val) {
      this.initData();
    }
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      if (this.async && this.allSearchData) {
        this.value = this.allSearchData.name;
        this.image = this.allSearchData.identityImg;
      }
    },
    onEmpty() {
      this.image = "";
    },
    onUpload(file) {
      let reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.addEventListener("load", () => {
        this.image = reader.result.substr(reader.result.indexOf(",") + 1);
      });
    },
    async onSearchAsync(val, cb) {
      this.asyncData = [];
      this.$refs.input.focus();

      if (this.image.includes(".")) {
        let _image = await getBase64(this.image);
        this.image = _image.substr(_image.indexOf(",") + 1);
      }

      postLabelSearch({
        keyword: this.value,
        image: this.image
      }).then(res => {
        this.listShow = true;
        this.asyncData = res.data || [];

        if (!this.asyncData.length) {
          this.$notify({
            title: "提示",
            message: "未匹配到相关人员",
            type: "warning",
            duration: 2000
          });
        }
      });
    },
    onItemChange(item) {
      this.value = item.name;
      this.image = item.identityImg;

      this.listShow = false;

      this.$emit("complete", item);
    },
    searchAsync() {
      if (this.value === "" && this.image === "") {
        this.$notify({
          title: "提示",
          message: "请输入搜索条件",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.onSearchAsync();
    },
    reset() {
      this.value = "";
      this.image = "";

      if (this.async) {
        this.$store.dispatch("allSearch/setData", null);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.medium {
  height: 36px;
  line-height: 36px;
  font-size: 26px;
  /deep/ {
    .el-input {
      input {
        padding: 0 68px 0 15px;
      }
      &.image {
        input {
          padding-left: 58px;
        }
      }
    }
  }
}
.small {
  height: 32px;
  line-height: 32px;
  font-size: 24px;
  /deep/ {
    .el-input {
      input {
        padding: 0 60px 0 10px;
      }
      &.image {
        input {
          padding-left: 52px;
        }
      }
    }
  }
}
.mini {
  height: 26px;
  line-height: 26px;
  font-size: 18px;
  /deep/ {
    .el-input {
      input {
        padding: 0 46px 0 8px;
      }
      &.image {
        input {
          padding-left: 46px;
        }
      }
    }
  }
}
.picture-search {
  position: relative;
  display: inline-block;
  line-height: 100%;
  .el-input {
    width: 100% !important;
    margin: 0;
    /deep/ {
      input {
        display: block;
      }
    }
  }
  .clearable {
    position: absolute;
    top: 50%;
    right: 1.9em;
    font-size: 0.8em;
    color: #878c8f;
    transform: translateY(-50%);
    cursor: pointer;
  }
  .prepend,
  .append {
    position: absolute;
    top: 50%;
    overflow: hidden;
    transform: translateY(-50%);
    z-index: 9;
  }
  .append {
    right: 6px;
    cursor: pointer;
    i {
      display: inline-block;
      vertical-align: top;
      color: #878c8f;
    }
  }
  .prepend {
    left: 5px;
    background: #fafbfd;
    overflow: hidden;
    border: 1px solid #e1e4e6;
    img {
      float: left;
      width: 1em;
      height: 1em;
    }
    .close {
      height: 1em;
      margin-left: 1em;
      cursor: pointer;
      i {
        position: relative;
        top: 50%;
        display: inline-block;
        vertical-align: top;
        font-size: 14px;
        color: #878c8f;
        transform: translateY(-50%);
      }
    }
  }
}

.search-list {
  position: absolute;
  left: 0;
  z-index: 999;
  .label-box {
    display: inline-block;
    height: 22px;
    padding-top: 2px;
    vertical-align: top;
  }
  .label-item {
    display: inline-block;
    height: 22px;
    line-height: 18px;
    margin: 0 2px;
    padding: 0 3px;
    text-align: center;
    border: 2px #fff solid;
    border-radius: 99px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    vertical-align: top;
    font-size: 12px;
    color: #fff;
  }
  .box {
    background: #fff;
    max-height: 288px;
    margin-top: 4px;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  }
  .scroll {
    max-height: 288px;
    padding: 2px;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
  }
  ul {
    border-radius: 8px;
    overflow: hidden;
  }
  li {
    position: relative;
    padding: 4px 5px;
    overflow: hidden;
    border-bottom: 1px solid #eff3f6;
    cursor: pointer;
    &:last-child {
      border-bottom: 0;
    }
    &.highlighted,
    &:hover {
      background: #7eb7f1;
      .name,
      .txt,
      .tip {
        color: #fff;
      }
    }
    .pic {
      float: left;
      width: 48px;
      height: 48px;
      margin-right: 8px;
      border-radius: 2px;
    }
    .name {
      line-height: 30px;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    .txt {
      line-height: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      color: #9da5af;
    }
    .tip {
      position: absolute;
      right: 12px;
      bottom: 2px;
      text-decoration: underline;
      font-size: 13px;
      color: #0fa0ff;
    }
  }
}
</style>