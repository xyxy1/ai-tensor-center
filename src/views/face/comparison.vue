<template>
  <div class="face-comparison-main">
    <el-row :gutter="10">
      <el-col :span="12">
        <el-card>
          <el-upload ref="leftUpload" action="" accept=".jpeg,.jpg,.png,.bmp" list-type="picture-card" :auto-upload="false" :multiple="true">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <el-upload ref="rightUpload" action="" accept=".jpeg,.jpg,.png,.bmp" list-type="picture-card" :auto-upload="false" :multiple="true">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-card>
      </el-col>
    </el-row>
    <div class="submit">
      <el-select v-model="submitQuery.flag" placeholder="请选择">
        <el-option :label="0" :value="0"></el-option>
        <el-option :label="1" :value="1"></el-option>
      </el-select>
      <el-button type="primary" @click="onSubmit">开始比对</el-button>
    </div>
    <div class="data-show" v-if="dataJson">
      <div class="tit">JSON数据结果</div>
      <code class="json" v-html="dataJson"></code>
    </div>
  </div>
</template>
<script>
import { postFaceCompare } from "@/api/faceModule/faceComparison";
export default {
  name: "face-comparison",
  data() {
    return {
      leftImage: "",
      submitQuery: {
        flag: 0,
        leftImageList: [],
        rightImageList: []
      },
      dataJson: null
    };
  },
  created() {},
  methods: {
    imgConvert(fileList) {
      let _arr = [];
      return new Promise((resolve, reject) => {
        // 开始上传右侧多张
        fileList.map(file => {
          let reader = new FileReader();
          reader.readAsDataURL(file.raw);
          reader.addEventListener("load", () => {
            _arr.push(reader.result.substr(reader.result.indexOf(",") + 1));

            // 多张图片上传完成
            if (_arr.length === fileList.length) {
              resolve(_arr);
            }
          });
        });
      });
    },
    async onSubmit() {
      if (
        !this.$refs.rightUpload.uploadFiles.length ||
        !this.$refs.leftUpload.uploadFiles.length
      ) {
        this.$notify({
          title: "提示",
          message: "请上传图片",
          type: "warning",
          duration: 2000
        });
      } else {
        this.dataJson = null;

        this.submitQuery.leftImageList = await this.imgConvert(
          this.$refs.leftUpload.uploadFiles
        );
        this.submitQuery.rightImageList = await this.imgConvert(
          this.$refs.rightUpload.uploadFiles
        );

        postFaceCompare(this.submitQuery).then(res => {
          this.dataJson = res;
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.face-comparison-main {
  padding: 20px;
  .submit {
    padding: 20px 0;
    clear: both;
    .el-button {
      width: 200px;
    }
  }
  .left-image {
    float: left;
    width: 400px;
    height: 400px;
    margin-right: 20px;
    /deep/ {
      .el-upload {
        position: relative;
        width: 100%;
        height: 100%;
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
        width: 100%;
        height: 100%;
      }
    }
  }
  .data-show {
    clear: both;
    border: 1px #eee solid;
    .tit {
      background: #eee;
      line-height: 40px;
      padding: 0 10px;
    }
    .json {
      background: #fff;
      margin: 0;
      padding: 10px;
      word-wrap: break-word;
    }
  }
}
</style>
