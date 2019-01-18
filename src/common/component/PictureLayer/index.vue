<template>
  <el-dialog title="选择分析对象" class="picture-layer body0" :visible.sync="isPictureDialog" width="1000px">
    <el-form :model="pictureQuery" ref="pictureForm" :rules="pictureFormRules" label-width="70px">
      <el-row>
        <el-col :span="7" class="left-form">
          <div class="croppa-box">
            <croppa v-model="croppa" :initial-image="pictureQuery.image" @loading-end="onImageLoading" :class="{error: croppaError}" accept=".jpeg,.jpg,.png" placeholder=" " :width="120" :height="120" :quality="2" :zoom-speed="10" :disabled="false" :prevent-white-space="true" :show-remove-button="true">
              <img slot="placeholder" src="~@/assets/upload-tips.jpg" />
            </croppa>
            <div class="tip">图片可进行拖动缩放</div>
          </div>
          <el-form-item label="关键字">
            <el-input v-model="pictureQuery.keyword" placeholder="姓名/证件号"></el-input>
          </el-form-item>
          <el-form-item class="threshold segmentation" label="阈　值" prop="threshold">
            <el-slider v-model="pictureQuery.threshold" :step="0.01" :min="0.35" :max="1" :format-tooltip="val => parseInt(val*100)+'%'"></el-slider>
            <div class="txt">{{parseInt(pictureQuery.threshold*100)}}%</div>
          </el-form-item>
          <el-form-item label="TOP N" prop="top">
            <el-input v-model.number="pictureQuery.top" placeholder="匹配到的人数"></el-input>
          </el-form-item>
          <el-form-item label="类　型" prop="labelNums">
            <el-select v-model="pictureQuery.labelNums" placeholder="请选择" multiple collapse-tags class="w100">
              <el-option v-for="item in labelTypeData" :key="item.num" :label="item.label" :value="item.num">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label-width="0">
            <el-button class="w100" type="success" @click="onPictureSubmit()">开始检索
              <i class="el-icon-caret-right"></i>
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="17" class="user-list">
          <div class="title">
            <b>搜索结果：</b>
            <em v-if="picUserData.length">{{picUserData.length}}</em>
            <div v-if="picUserData.length" class="tip">请选择要分析的人员</div>
          </div>
          <div class="img-list">
            <div class="item" v-for="(item,index) in picUserData" :key="index" :class="{sel: listIds.includes(item.identityNo)}" @click="onChangeRow(item, index)">
              <div class="pic">
                <img :src="item.identityImgUrl+'?v='+imgKey">
                <div class="label-list">
                  <div class="top-label" v-for="(label,index) in item.shortNames.split(',')" :key="index" :style="{zIndex:10-index}">
                    <span :style="{backgroundColor:label.split('|')[1],color:colorBrightness(label.split('|')[1])}">{{label.split('|')[0]}}</span>
                    <i :style="{borderLeftColor:label.split('|')[1]}" class="icon"></i>
                  </div>
                </div>
                <div class="mask" v-if="item.similarity">
                  相似度：
                  <b>{{item.similarity}}%</b>
                </div>
              </div>
              <div class="box">
                <div class="txt">
                  <svg-icon icon-class="user" />
                  <b class="name">{{item.name}}</b>
                  <el-checkbox :value="listIds.includes(item.identityNo)" />
                </div>
                <div class="txt">
                  <svg-icon icon-class="credentials" />
                  <label>{{item.identityNo}}</label>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="onUserListSubmit">开始分析</el-button>
      <el-button size="mini" @click="isPictureDialog = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getBase64 } from "@/utils";
import { getLabelType } from "@/api/faceModule/faceLabel/index";
import { postImageSearch } from "@/api/trajectory";

export default {
  props: {
    jump: {
      default: false,
      type: Boolean
    },
    isOpen: {
      default: false,
      type: Boolean
    },
    data: Object
  },
  watch: {
    isOpen(val) {
      this.isPictureDialog = val;
    },
    isPictureDialog(val) {
      this.$emit("update:isOpen", val);
    }
  },
  data() {
    return {
      imgKey: new Date().getTime(),

      croppa: {},
      labelTypeData: [],
      picUserData: [], // 以图搜图返回的用户数据
      isPictureDialog: false,
      pictureQuery: {
        keyword: "",
        image: null,
        threshold: 0.6,
        top: 10,
        labelNums: []
      },
      croppaError: false,
      pictureFormRules: {
        threshold: {
          type: "number",
          required: true,
          message: "请输入正确的阈值"
        },
        top: [
          { required: true, message: "人数不能为空" },
          { type: "number", min: 1, message: "人数不能小于1人" }
        ],
        labelNums: {
          type: "array",
          required: true,
          message: "请选择类型"
        }
      },
      listIds: [],
      confirmList: []
    };
  },
  created() {
    this.getTree();
  },
  methods: {
    open(data) {
      this.pictureQuery = Object.assign(this.pictureQuery, data);
      this.isPictureDialog = true;
      this.croppa.refresh && this.croppa.refresh();

      if (this.pictureQuery.image.includes("data:image/jpeg;base64,")) {
        this.$nextTick(() => {
          this.onPictureSubmit(true);
        });
      }
    },
    onImageLoading() {
      if (this.jump) {
        this.$nextTick(() => {
          this.onPictureSubmit();
        });
      }
    },
    getTree(cb) {
      getLabelType().then(data => {
        this.labelTypeData = data.data.rows;
        this.pictureQuery.labelNums = this.labelTypeData.map(item => {
          return item.num;
        });
        cb && cb();
      });
    },
    onPictureSubmit(isCroppa) {
      if (!this.croppa.img && !this.pictureQuery.keyword.toString().length) {
        this.$notify({
          title: "提示",
          message: "图片或关键字必须填写",
          type: "warning",
          duration: 2000
        });
        return;
      }

      // 清空处理
      this.listIds = [];
      this.confirmList = [];
      this.picUserData = [];

      // 获取图片
      if (!isCroppa) {
        this.pictureQuery.image = this.croppa.generateDataUrl();
      }

      this.$refs.pictureForm.validate(valid => {
        if (!valid) return false;

        let _json = Object.assign({}, this.pictureQuery);
        _json.labelNums = _json.labelNums.join(",");
        _json.image = _json.image.substr(_json.image.indexOf(",") + 1);
        postImageSearch(_json).then(res => {
          let isSuccess = res.status === 200;
          // 错误处理
          if (!isSuccess) {
            this.$notify({
              title: "失败",
              message: res.message,
              type: "error",
              duration: 2000
            });
            return;
          }

          // 成功处理
          if (res.data.length < 1) {
            this.$notify({
              title: "提示",
              message: "抱歉，没能找到匹配的人员",
              type: "warning",
              duration: 2000
            });
            return;
          }

          this.imgKey = new Date().getTime();
          this.picUserData = res.data;
        });
      });
    },
    onChangeRow(row, index) {
      let _index = this.listIds.indexOf(row.identityNo);

      this.$set(this.listIds, index, _index < 0 ? row.identityNo : null);
      this.$set(this.confirmList, index, _index < 0 ? row : null);
    },
    // 选择匹配图片
    onUserListSubmit() {
      // 过滤空数据
      let _data = this.confirmList.filter(item => !!item);

      // 判断至少选中一个人员
      if (!_data.length) {
        this.$notify({
          title: "提示",
          message: "请先选择一个人员",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.isPictureDialog = false;
      this.$emit("complete", _data);

      if (this.jump) {
        this.$router.push({
          name: "人脸轨迹分析",
          params: { data: _data }
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.picture-layer {
  .w100 {
    width: 100%;
  }
  /deep/ .el-slider__runway {
    margin: 15px 0;
  }
  /deep/ .el-form-item__label {
    font-size: 13px;
  }
  .segmentation {
    padding-top: 10px;
    border-top: 1px #e5e5e5 solid;
  }
  .left-form {
    background: #fafbfd;
    padding: 25px 10px;
    border-right: 1px #e5e5e5 solid;
  }
  .threshold {
    position: relative;
    .el-slider {
      padding: 0 46px 0 8px;
    }
    .txt {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 13px;
      font-weight: bold;
      color: #3f4041;
    }
  }
  .croppa-box {
    margin-bottom: 10px;
  }
  .croppa-container {
    display: block;
    width: 120px;
    height: 120px;
    margin: 0 auto;
    border: 1px #fff solid;
    border-radius: 8px;
    /deep/ {
      canvas {
        border-radius: 8px;
      }
      svg {
        top: -10px !important;
        right: -10px !important;
        width: 20px !important;
        height: 20px !important;
      }
    }
    &.error {
      border: 1px #f56c6c solid;
    }
  }
  .tip {
    line-height: 30px;
    text-align: center;
    font-size: 12px;
    color: #adb1b4;
  }
}
.label-list {
  position: absolute;
  top: 0;
  left: 0;
  padding-left: 2px;
  .top-label {
    position: relative;
    float: left;
    line-height: 18px;
    margin-left: -6px;
    padding-right: 6px;
    overflow: hidden;
    font-size: 12px;
    span {
      display: block;
      padding: 0 2px 0 8px;
    }
    .icon {
      position: absolute;
      top: -9px;
      right: 0;
      width: 0;
      height: 0;
      float: left;
      border-left: 6px solid #fff;
      border-top: 9px solid transparent;
      border-bottom: 18px solid transparent;
      content: "";
    }
  }
}
.user-list {
  .mt20 {
    margin-top: 20px;
  }
  .title {
    background: #f2f2f2;
    height: 28px;
    line-height: 28px;
    padding: 0 12px;
    font-size: 14px;
    color: #333;
    em {
      background: #b5c0cd;
      padding: 0 10px;
      border-radius: 99px;
      font-style: normal;
      color: #fff;
    }
    .tip {
      float: right;
      font-size: 13px;
      color: #adb1b4;
    }
  }
  .img-list {
    position: relative;
    max-height: 440px;
    margin-top: 10px;
    padding-bottom: 10px;
    overflow: auto;
    .pic {
      position: relative;
      width: 160px;
      height: 160px;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    .mask {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.4);
      line-height: 18px;
      padding-right: 6px;
      text-align: right;
      font-size: 12px;
      color: #fafbfd;
      b {
        display: inline-block;
        vertical-align: top;
        font-size: 14px;
        color: #ffc600;
      }
    }
    .item {
      float: left;
      margin: 10px 0 0 10px;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(0, 0, 0, 0.1);
      &.sel {
        border-color: #0fa0ff;
      }
      label {
        font-size: 12px;
        color: #9da5af;
      }
      .box {
        width: 160px;
        padding: 6px;
        b {
          font-size: 14px;
          color: #333;
        }
      }
      .txt {
        display: flex;
        width: 100%;
        height: 18px;
        line-height: 18px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .svg-icon {
        display: inline-block;
        height: 100%;
        margin-right: 4px;
        vertical-align: top;
        color: #b5c0cd;
      }
      .el-checkbox {
        float: right;
        margin-left: 4px;
        pointer-events: none;
      }
    }
  }
}
</style>
