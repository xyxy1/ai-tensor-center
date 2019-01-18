<template>

  <!-- 详情&处理 -->
  <el-dialog :title="`${data.handleFlag == 1?'查看':'处理'}告警信息`" class="dispose-layer body0" width="600px" :visible.sync="isDisposeDialog" v-if="data" append-to-body>
    <div class="title">
      <b>{{data.monitorName}}</b>
      <p v-if="data.monitorTimeFlag == '0'">长期有效</p>
      <p v-else>布控时间：{{data.monitorTimeStart}}　至　{{data.monitorTimeEnd}}</p>
    </div>
    <div class="main" v-if="data.alarmType == '0'">
      <div class="tit">命中详情：</div>
      <el-row :gutter="20">
        <el-col :span="13">
          <div class="pic-box">
            <div class="item">
              <img-show width="120px" height="120px" text="暂无头像" :img-src="data.snapImg" />
              <div class="txt">抓拍照片</div>
            </div>
            <div class="item">
              <img-show width="120px" height="120px" text="暂无头像" :img-src="data.identityImgUrl" />
              <div class="txt">证件照</div>
            </div>
            <div class="similarity">{{data.similarity}}%</div>
          </div>
        </el-col>
        <el-col :span="11">
          <div class="pic-box">
            <a @click="onLookPicture(data.snapBgImgUrl)">
              <img-show height="120px" txt="暂无背景" :img-src="data.snapBgImgUrl" />
            </a>
            <div class="txt">背景图</div>
          </div>
        </el-col>
      </el-row>
      <ul class="info">
        <li class="w60"><span>布控人员：{{data.name}}</span></li>
        <li class="w20"><span>年龄：{{data.age}}岁</span></li>
        <li class="w20"><span>性别：{{data.sex}}</span></li>
        <li><span>证件号码：{{data.identityNo}}</span></li>
        <li>
          <span>处理说明：</span>
          <el-input type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }" placeholder="请填写处理结果" v-model="data.handleContent" :readonly="data.handleFlag == 1" />
        </li>
      </ul>
    </div>
    <div class="main" v-if="data.alarmType == '1'">
      <div class="tit">命中详情：</div>
      <el-row :gutter="20">
        <el-col :span="7">
          <div class="pic-box">
            <div class="item">
              <img-show width="120px" height="120px" text="暂无头像" :img-src="data.identityImgUrl" />
              <div class="txt">证件照</div>
            </div>
          </div>
        </el-col>
        <el-col :span="17">
          <ul class="info">
            <li class="mb">最后出现：{{data.lastTime}}</li>
            <li><span>布控人员：{{data.name}}</span></li>
            <li><span>年龄：{{data.age}}岁</span></li>
            <li><span>性别：{{data.sex}}</span></li>
            <li><span>证件号码：{{data.identityNo}}</span></li>
          </ul>
        </el-col>
        <el-col :span="24" class="dispose-box">
          <p>处理说明：</p>
          <el-input type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }" placeholder="请填写处理结果" v-model="data.handleContent" :readonly="data.handleFlag == 1" />
        </el-col>
      </el-row>
    </div>
    <div slot="footer">
      <template v-if="data.handleFlag == 0">
        <el-button size="mini" type="primary" @click="onSubmit">保 存</el-button>
        <el-button size="mini" @click="isDisposeDialog = false">取 消</el-button>
      </template>
      <el-button size="mini" type="primary" v-else @click="isDisposeDialog = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { postAlarmHandle } from "@/api/bigData/alarmNews";

export default {
  props: {
    data: Object,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data: () => ({
    isDisposeDialog: false
  }),
  watch: {
    isOpen(val) {
      this.isDisposeDialog = val;
    },
    isDisposeDialog(val) {
      this.$emit("update:isOpen", val);
    }
  },
  methods: {
    onSubmit() {
      if (this.data.handleContent == null || this.data.handleContent == "") {
        this.$notify({
          title: "提示",
          message: "请填写处理结果",
          type: "warning",
          duration: 2000
        });
        return;
      }

      postAlarmHandle({
        id: this.data.id,
        handleContent: this.data.handleContent
      }).then(res => {
        let isSuccess = res.status === 200;
        this.$notify({
          title: isSuccess ? "成功" : "失败",
          message: isSuccess ? "处理成功" : res.message,
          type: isSuccess ? "success" : "error",
          duration: 2000
        });

        if (isSuccess) {
          this.isDisposeDialog = false;
          this.$emit("complete");
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.dispose-layer {
  .title {
    background: #fafbfd;
    padding: 12px 14px;
    border-bottom: 1px solid #e5e5e5;
    font-size: 16px;
    color: #3f4041;
    p {
      margin-top: 4px;
      font-size: 13px;
      color: #999;
    }
  }
  .main {
    padding: 10px 10px 2px;
    .tit {
      line-height: 32px;
      font-size: 14px;
      color: #3f4041;
    }
    .pic-box {
      position: relative;
      padding: 12px 0 0;
      overflow: hidden;
      border: 1px solid #edeff3;
      border-radius: 10px;
      text-align: center;
      .item {
        display: inline-block;
        width: 120px;
        vertical-align: top;
        margin: 0 8px;
        font-size: 0;
      }
      .img-show {
        display: inline-block;
        max-width: 220px;
        vertical-align: top;
      }
      .txt {
        line-height: 24px;
        font-size: 12px;
        color: #adb1b4;
      }
      .similarity {
        position: absolute;
        left: 50%;
        bottom: 24px;
        background: #f00;
        width: 60px;
        height: 16px;
        line-height: 16px;
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        color: #fff;
        transform: translateX(-50%);
        &:before {
          position: absolute;
          top: 0;
          left: -16px;
          width: 0;
          height: 0;
          float: left;
          border-width: 0 0 16px 16px;
          border-style: solid;
          border-color: transparent transparent #f00 transparent;
          content: "";
        }
        &:after {
          position: absolute;
          top: 0;
          right: -16px;
          width: 0;
          height: 0;
          float: left;
          border-width: 0 16px 16px 0;
          border-style: solid;
          border-color: transparent transparent #f00 transparent;
          content: "";
        }
      }
    }
    .info {
      margin-top: 8px;
      overflow: hidden;
      li {
        display: flex;
        float: left;
        width: 100%;
        line-height: 20px;
        margin-bottom: 8px;
        font-size: 13px;
        color: #3f4041;
        &.w60 {
          width: 60%;
        }
        &.w20 {
          width: 20%;
        }
        &.mb {
          margin-bottom: 18px;
        }
      }
      span {
        color: #999;
      }
      .el-textarea {
        flex: 1;
      }
    }
  }
  .dispose-box {
    padding: 10px 0;
    font-size: 13px;
    color: #999;
    p {
      line-height: 20px;
    }
  }
}
</style>