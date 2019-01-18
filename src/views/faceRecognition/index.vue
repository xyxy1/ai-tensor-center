<template>
  <el-tabs type="border-card" class="app-container">
    <el-tab-pane label="人脸比对">
      <div class="tip">
        <p>即刻体验TensorFace的人脸比对能力。请上传本地人像图片。</p>
        <p>该功能将计算比对目标人脸与比对人脸两两之间的相似程度，并给出相似度评分，以便分析属于一个人的可能性。</p>
      </div>
      <div class="comparison-box">
        <div class="left-box">
          <el-upload action="" accept=".jpeg,.jpg,.png,.bmp" list-type="picture-card" :on-change="onComparisonUpload" :show-file-list="false" :auto-upload="false">
            <img v-if="comparison.leftImage" :src="'data:image/jpeg;base64,' + comparison.leftImage" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <el-button size="small" type="success" @click="onComparisonSubmit">开始对比</el-button>
        </div>
        <div class="right-box">
          <el-upload ref="comparisonRightUpload" action="" accept=".jpeg,.jpg,.png,.bmp" list-type="picture-card" :auto-upload="false" :multiple="true">
            <i class="el-icon-plus"></i>
          </el-upload>
        </div>
      </div>
      <el-tabs value="first" class="data-show">
        <el-tab-pane label="比对结果" name="first">
          <p v-for="(item,index) in comparison.data[0]" :key="index" v-if="comparison.data.length">
            <span>比对{{index+1}}：</span>同一个人的可能性{{comparisonResult(item)}}；
          </p>
        </el-tab-pane>
        <el-tab-pane label="Response JSON" name="second">
          <p v-for="(item,index) in comparison.data[0]" :key="index" v-if="comparison.data.length">
            <span>比对{{index+1}}：</span>{{item}}
          </p>
        </el-tab-pane>
      </el-tabs>
    </el-tab-pane>

    <el-tab-pane label="人脸检测">
      <div class="tip">
        <p>即刻体验TensorFace的人脸检测能力。请上传本地人像图片。</p>
        <p>该功能检测并定位图片中的人脸，返回高精度的人脸框坐标。TensorFace还支持存储检测到的人脸元数据，以便日后使用。</p>
      </div>
      <div class="location-box">
        <div class="left-box">
          <el-upload class="image-upload" action="" accept=".jpeg,.jpg,.png,.bmp" list-type="picture-card" :on-change="onLocationUpload" :show-file-list="false" :auto-upload="false">
            <img v-if="location.form.image" :src="'data:image/jpeg;base64,' + location.form.image" class="avatar" @load="onLocationLoadPic($event)">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="face-list" :style="{width: location.image.width+'px', height: location.image.height+'px'}">
              <div class="face-item" v-for="(item,index) in location.faceList.concat(location.faceDeepList)" :key="index" :class="{col1: item.deep}" :style="{top: item.top+ 'px', left: item.left+ 'px', width: item.width+ 'px', height: item.height+ 'px'} "></div>
            </div>
          </el-upload>
          <el-button size="small" class="input-w" type="success" @click="onLocationSubmit">开始分析</el-button>
          <el-button size="small" type="danger" @click="onLocationSubmit('deep')">深度分析</el-button>
        </div>
        <el-tabs v-model="location.tabsIndex" class="data-show">
          <el-tab-pane label="分析结果" name="0">
            <template v-if="location.data">
              <p>已检测到图中 {{location.data.length}} 张人脸，并返回接口数据如下：</p>
              <p v-for="(item, index) in location.data" :key="index" v-html="item"></p>
            </template>
          </el-tab-pane>
          <el-tab-pane label="深度分析结果" name="1">
            <template v-if="location.deepData">
              <p>已检测到图中 {{location.deepData.length}} 张人脸，并返回接口数据如下：</p>
              <p v-for="(item, index) in location.deepData" :key="index" v-html="item"></p>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import { postFaceCompare } from "@/api/faceModule/faceComparison";
import {
  postFaceDetect,
  postFaceDeepDetect
} from "@/api/faceModule/faceLocation";

export default {
  name: "faceRecognition",
  data: () => ({
    comparison: {
      leftImage: "",
      form: {
        leftImageList: [],
        rightImageList: []
      },
      data: []
    },
    location: {
      form: {
        image: ""
      },
      zoom: 1, // 用于判断图片是否缩小
      data: null,
      deepData: null,
      faceList: [], // 人脸框
      faceDeepList: [], // 人脸框
      image: {
        width: null,
        height: null
      },
      tabsIndex: "0"
    }
  }),
  methods: {
    comparisonResult(val) {
      if (val < 0.7) {
        return "低";
      } else if (val > 0.85) {
        return "很高";
      } else {
        return "高";
      }
    },
    onComparisonUpload(file, fileList) {
      let reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.addEventListener("load", () => {
        this.comparison.leftImage = reader.result.substr(
          reader.result.indexOf(",") + 1
        );
      });
    },
    onComparisonSubmit() {
      let _files = this.$refs.comparisonRightUpload.uploadFiles;
      if (!_files.length || !this.comparison.leftImage) {
        this.$notify({
          title: "提示",
          message: "请上传图片",
          type: "warning",
          duration: 2000
        });
      } else {
        let _index = 0;
        this.comparison.form.leftImageList = [];
        this.comparison.form.rightImageList = [];
        this.location.data = null;
        // 开始上传右侧多张
        _files.map((file, index) => {
          let reader = new FileReader();
          reader.readAsDataURL(file.raw);
          reader.addEventListener("load", () => {
            _index++;
            this.$set(
              this.comparison.form.rightImageList,
              index,
              reader.result.substr(reader.result.indexOf(",") + 1)
            );

            // 多张图片上传完成
            if (_index === _files.length) {
              this.comparison.form.leftImageList.push(
                this.comparison.leftImage
              );
              postFaceCompare(this.comparison.form).then(res => {
                if (res.status != 200) {
                  this.$notify({
                    title: "对比失败",
                    message: res.message,
                    type: "error",
                    duration: 2000
                  });
                  return;
                }
                this.comparison.data = res.data;
              });
            }
          });
        });
      }
    },
    onLocationLoadPic(ev) {
      this.location.image = {
        width: ev.target.width,
        height: ev.target.height
      };

      this.zoom = 1;
      if (ev.target.naturalHeight > ev.target.height) {
        this.zoom = ev.target.height / ev.target.naturalHeight;
      }
    },
    onLocationUpload(file, fileList) {
      this.location.faceList = [];
      this.location.data = null;
      this.location.deepData = null;

      let reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.addEventListener("load", () => {
        this.location.form.image = reader.result.substr(
          reader.result.indexOf(",") + 1
        );
      });
    },
    onLocationSubmit(val) {
      if (!this.location.form.image) {
        this.$notify({
          title: "提示",
          message: "请上传图片",
          type: "warning",
          duration: 2000
        });
      } else {
        if (val === "deep") {
          this.location.tabsIndex = "1";
          postFaceDeepDetect(this.location.form).then(res => {
            if (res.status != 200) {
              this.$notify({
                title: "分析失败",
                message: res.message,
                type: "error",
                duration: 2000
              });
              return;
            }

            this.location.deepData = res.data;
            if (this.location.deepData && this.location.deepData.length > 0) {
              this.location.faceDeepList = [];
              this.location.deepData.forEach(item => {
                this.location.faceDeepList.push({
                  deep: true,
                  top: item.leftTopY * this.zoom,
                  left: item.leftTopX * this.zoom,
                  width: (item.rightBottomX - item.leftTopX) * this.zoom,
                  height: (item.rightBottomY - item.leftTopY) * this.zoom
                });
              });
            }
          });
        } else {
          this.location.tabsIndex = "0";
          postFaceDetect(this.location.form).then(res => {
            if (res.status != 200) {
              this.$notify({
                title: "分析失败",
                message: res.message,
                type: "error",
                duration: 2000
              });
              return;
            }

            this.location.data = res.data;
            if (this.location.data && this.location.data.length > 0) {
              this.location.faceList = [];
              this.location.data.forEach(item => {
                this.location.faceList.push({
                  top: item.leftTopY * this.zoom,
                  left: item.leftTopX * this.zoom,
                  width: (item.rightBottomX - item.leftTopX) * this.zoom,
                  height: (item.rightBottomY - item.leftTopY) * this.zoom
                });
              });
            }
          });
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  height: 100%;
  /deep/ {
    .el-tabs__header {
      background: #fafbfd;
    }
    .el-tabs__content {
      height: calc(100% - 45px);
      overflow: auto;
    }
    .el-tabs__item {
      width: 120px;
      height: 46px;
      line-height: 46px;
      padding: 0;
      border-right: 1px solid #e4e5e6;
      text-align: center;
      font-size: 14px;
      color: #666;
      &.is-active {
        background: #eaeaea;
        font-weight: bold;
        color: #353535;
      }
    }
  }
  .tip {
    line-height: 180%;
    margin-bottom: 8px;
    font-size: 14px;
    color: #666;
  }
  .data-show {
    background: #fff;
    margin-top: 10px;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    /deep/ {
      .el-tabs__header {
        background: transparent;
        padding-left: 20px;
      }
      .el-tabs__content {
        line-height: 180%;
        padding: 0 20px 20px;
        font-size: 13px;
        color: #333;
        span {
          color: #999;
        }
      }
      .el-tabs__item {
        width: auto;
        height: 36px;
        line-height: 36px;
        margin-right: 20px;
        padding: 0 20px 0 0;
        border: 0;
        font-size: 14px;
        color: #333;
        &.is-active {
          background: transparent;
          font-weight: bold;
          color: #0fa0ff;
        }
      }
      .el-tabs__nav-wrap:after {
        content: none;
      }
    }
  }
}
.comparison-box {
  display: flex;
  overflow: hidden;
  border: 1px solid #dee3e6;
  border-radius: 6px;
  .left-box {
    flex: none;
    background: #fafbfd;
    width: 272px;
    padding: 8px;
    border-right: 1px solid #dee3e6;
    /deep/ {
      .el-upload {
        position: relative;
        width: 255px;
        height: 255px;
      }
      .avatar-uploader-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        font-size: 80px;
        transform: translate(-50%, -50%);
      }
      img {
        width: 100%;
        height: 100%;
        border-radius: 6px;
      }
    }
    .el-button {
      width: 100%;
      margin-top: 8px;
    }
  }
  .right-box {
    flex: 1;
    width: 100%;
    padding: 8px;
  }
}
.location-box {
  display: flex;
  overflow: hidden;
  border: 1px solid #dee3e6;
  border-radius: 6px;
  .left-box {
    flex: none;
    background: #fafbfd;
    width: 272px;
    padding: 8px;
    border-right: 1px solid #dee3e6;
    /deep/ {
      .el-upload {
        position: relative;
        width: 255px;
        height: 255px;
        overflow: hidden;
      }
      .avatar-uploader-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        font-size: 80px;
        transform: translate(-50%, -50%);
      }
      img {
        position: absolute;
        top: 50%;
        left: 50%;
        max-width: 100%;
        max-height: 100%;
        transform: translate(-50%, -50%);
      }
    }
    .el-button {
      margin-top: 8px;
      &.input-w {
        width: 160px;
      }
    }
    .face-list {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .face-item {
      position: absolute;
      border: 2px #42b983 solid;
      &.col1 {
        border-color: #f42b4c;
      }
    }
  }
  .data-show {
    flex: 1;
    width: 100%;
    margin: 0;
    border: 0;
  }
}
</style>