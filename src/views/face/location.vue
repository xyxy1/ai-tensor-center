<template>
  <div class="face-location-main">
    <el-upload ref="upload" class="image-upload" action="" accept=".jpeg,.jpg,.png,.bmp" list-type="picture-card" :on-change="onUpload" :show-file-list="false" :auto-upload="false">
      <img v-if="submitQuery.image" :src="'data:image/jpeg;base64,' + submitQuery.image" class="avatar" @load="onLoadPic($event)">
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      <div class="face-item" v-for="(item,index) in faceList" :class="{col1:item.deep}" :style="{top: item.top+'px', left: item.left+'px', width: item.width+'px', height: item.height+'px'}" :key="index"></div>
    </el-upload>
    <div class="submit">
      <el-button type="primary" @click="onSubmit">开始分析</el-button>
      <el-button type="primary" class="col1" @click="onSubmit('deep')">深度分析</el-button>
    </div>
    <el-tabs v-model="tabsIndex" type="border-card">
      <el-tab-pane label="分析结果" name="0">
        <code class="json" v-html="dataJson" v-if="dataJson"></code>
      </el-tab-pane>
      <el-tab-pane label="深度分析结果" name="1">
        <code class="json" v-html="deepDataJson" v-if="deepDataJson"></code>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import {
  postFaceDetect,
  postFaceDeepDetect
} from "@/api/faceModule/faceLocation";
export default {
  name: "face-location",
  data() {
    return {
      submitQuery: {
        image: ""
      },
      zoom: 1, // 用于判断图片是否缩小
      dataJson: null,
      deepDataJson: null,
      faceList: [], // 人脸框
      tabsIndex: 0
    };
  },
  created() {},
  methods: {
    onLoadPic(ev) {
      this.zoom = 1;
      if (ev.target.naturalHeight > 400) {
        this.zoom = 400 / ev.target.naturalHeight;
      }
    },
    onUpload(file, fileList) {
      this.faceList = [];
      this.dataJson = null;

      let reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.addEventListener("load", () => {
        this.submitQuery.image = reader.result.substr(
          reader.result.indexOf(",") + 1
        );
      });
    },
    onSubmit(val) {
      if (!this.submitQuery.image) {
        this.$notify({
          title: "提示",
          message: "请上传图片",
          type: "warning",
          duration: 2000
        });
      } else {
        if (val === "deep") {
          this.tabsIndex = "1";
          postFaceDeepDetect(this.submitQuery).then(res => {
            this.deepDataJson = res;
            if (this.deepDataJson.data && this.deepDataJson.data.length > 0) {
              this.deepDataJson.data.forEach(item => {
                this.faceList.push({
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
          this.tabsIndex = "0";
          postFaceDetect(this.submitQuery).then(res => {
            this.dataJson = res;
            if (this.dataJson.data && this.dataJson.data.length > 0) {
              this.dataJson.data.forEach(item => {
                this.faceList.push({
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
.face-location-main {
  padding: 20px;
  .submit {
    padding: 20px 0;
    clear: both;
    .el-button {
      width: 200px;
      height: 40px;
      &.col1 {
        background-color: #f42b4c;
        border-color: #f42b4c;
      }
    }
  }
  .image-upload {
    float: left;
    min-width: 200px;
    min-height: 200px;
    margin-right: 20px;
    /deep/ {
      .el-upload {
        position: relative;
        width: 100%;
        height: auto;
        min-height: 200px;
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
        display: block;
        width: auto;
        max-height: 400px;
      }
    }
  }
  .face-item {
    position: absolute;
    border: 2px #42b983 solid;
    &.col1 {
      border-color: #f42b4c;
    }
  }
  code {
    margin: 0;
  }
}
</style>
