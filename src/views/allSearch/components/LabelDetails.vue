<template>
  <div class="label-details">
    <template v-if="details">
      <img src="~@/assets/control.png" class="control" v-if="details.monitorFlag == 1">
      <div class="pic">
        <img-show :img-src="details.identityImgShow" txt="暂无照片" width="120px" height="148px" base64></img-show>
      </div>
      <div class="info">
        <ul>
          <li>
            <span>姓名：</span>
            {{details.name}}
          </li>
          <li>
            <span>性别：</span>
            {{details.sex}}
          </li>
          <li>
            <span>民族：</span>
            {{details.nation}}
          </li>
          <li>
            <span>电话：</span>
            {{details.tel}}
          </li>
          <li>
            <span>证件号：</span>
            {{details.identityNo}}
          </li>
          <li>
            <span>生日：</span>
            {{moment(details.birth, "YYYY-MM-DD").format("YYYY年MM月DD日")}}
          </li>
          <li class="w100">
            <span>类型：</span>
            <div class="label-box">
              <label class="label-item" v-if="details.labelNames" v-for="(label,index) in details.labelNames.split(',')" :key="index" :style="{backgroundColor:label.split('|')[1],color:colorBrightness(label.split('|')[1])}">{{label.split('|')[0]}}</label>
            </div>
          </li>
          <li class="w100">
            <span>门牌楼号：</span>
            {{details.mlph?details.mlph.content:''}}
          </li>
          <li class="w100">
            <span>证件地址：</span>
            {{details.address}}
          </li>
          <li class="w100">
            <span>现住址：</span>
            {{details.actualAddress}}
          </li>
          <li class="w100">
            <span>门禁权限：</span>
            <div class="accesse-box">
              <div class="accesse-item" v-for="item in details.labelAccess" :key="item.id">{{item.accessName}}</div>
            </div>
          </li>
          <li class="w100">
            <span>人像库：</span>
            <div class="image-list">
              <img :src="'data:image/jpeg;base64,'+item.imgShow" v-for="(item,index) in details.labelImages" :key="index">
            </div>
            <div class="image-tip" v-if="details.labelImages.length" @click="isPicListDialog = true">查看大图</div>
          </li>
          <li class="w100">
            <span>备注：</span>
            {{details.remark}}
          </li>
        </ul>
      </div>

      <!-- 人像库图片列表 -->
      <pic-list :is-open.sync="isPicListDialog" :data="details.labelImages" />
    </template>
  </div>
</template>
<script>
import moment from "moment";
import { getLabelDetails } from "@/api/allSearch/index";

export default {
  props: {
    data: [Array, Object]
  },
  data: () => ({
    moment: moment,
    details: null,

    // 人像库图表列表
    isPicListDialog: false
  }),
  methods: {
    init() {
      this.getDatails();
    },
    getDatails() {
      getLabelDetails(this.data.id).then(res => {
        if (res.status == 200) {
          this.details = res.data;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.label-details {
  position: relative;
  padding: 25px 30px;
  overflow: hidden;
  .control {
    position: absolute;
    top: 150px;
    left: 70px;
    z-index: 9;
  }
  .pic {
    float: left;
    .img-show {
      border: 1px solid #dee3e6;
    }
  }
  .info {
    margin-left: 160px;
    ul {
      width: 720px;
      overflow: hidden;
      font-size: 13px;
      color: #3f4041;
    }
    li {
      float: left;
      width: 50%;
      line-height: 36px;
      &.w100 {
        width: 100%;
      }
    }
    span {
      display: inline-block;
      width: 80px;
      padding-right: 10px;
      vertical-align: top;
      text-align: right;
      color: #999;
    }
    .image-list {
      background: #f3f4f5;
      display: inline-block;
      padding: 8px 8px;
      border: 1px solid #e1e4e6;
      border-radius: 6px;
      vertical-align: top;
      img {
        float: left;
        width: 48px;
        height: 48px;
        margin: 0 6px;
        border-radius: 2px;
      }
    }
    .image-tip {
      display: inline-block;
      line-height: 100%;
      margin-left: 8px;
      border-bottom: 1px solid #0fa0ff;
      color: #0fa0ff;
      cursor: pointer;
    }
  }

  .label-box {
    display: inline-block;
    padding: 6px 0 0;
  }
  .label-item {
    display: inline-block;
    height: 22px;
    line-height: 18px;
    padding: 0 6px;
    margin: 0 4px 4px;
    text-align: center;
    border: 2px #fff solid;
    border-radius: 99px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    vertical-align: top;
    font-size: 12px;
    color: #fff;
  }

  .accesse-box {
    display: inline-block;
    overflow: hidden;
  }
  .accesse-item {
    float: left;
    line-height: 22px;
    margin: 6px 8px 0 0;
    padding: 0 8px;
    border: 1px solid #0fa0ff;
    border-radius: 99px;
    font-size: 12px;
    color: #0fa0ff;
  }
}
</style>
