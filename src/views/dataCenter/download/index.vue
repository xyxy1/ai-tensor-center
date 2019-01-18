<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        异常数据
      </div>
    </div>

    <div class="main">
      <el-row :gutter="8">
        <el-col :span="12">
          <div class="file-list">
            <div class="title">
              未对齐列表
            </div>
            <div class="box">
              <div class="list" v-if="noDetectListData.length > 0">
                <div class="item" v-for="(item,index) in noDetectListData" :key="index">
                  <svg-icon icon-class="folder" />
                  <span>{{item}}</span>
                  <el-button type="text" size="mini" @click="onDeleteFile(0,item)">
                    <i class="el-icon-delete"></i>
                  </el-button>
                  <el-button type="text" size="mini" @click="onDownloadFile(0,item)">
                    <i class="el-icon-download"></i>
                  </el-button>
                </div>
              </div>
              <div class="tip" v-else>暂无数据</div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="file-list">
            <div class="title">
              异常列表
            </div>
            <div class="box">
              <div class="list" v-if="abnormalListData.length > 0">
                <div class="item" v-for="(item,index) in abnormalListData" :key="index">
                  <svg-icon icon-class="folder" />
                  <span>{{item}}</span>
                  <el-button type="text" size="mini" @click="onDeleteFile(1,item)">
                    <i class="el-icon-delete"></i>
                  </el-button>
                  <el-button type="text" size="mini" @click="onDownloadFile(1,item)">
                    <i class="el-icon-download"></i>
                  </el-button>
                </div>
              </div>
              <div class="tip" v-else>暂无数据</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import {
  getNoDetectList,
  getAbnormalList,
  getNoDetectZip,
  getAbnormalZip,
  delNoDetectFile,
  delAbnormalFile
} from "@/api/dataCenter/download";
export default {
  name: "dataCenter-download",
  components: {},
  data() {
    return {
      noDetectListData: [],
      abnormalListData: []
    };
  },
  created() {
    this.noDetectList();
    this.abnormalList();
  },
  methods: {
    // 获取未对齐数据
    noDetectList() {
      getNoDetectList().then(res => {
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

        this.noDetectListData = res.data;
      });
    },
    // 获取异常数据
    abnormalList() {
      getAbnormalList().then(res => {
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

        this.abnormalListData = res.data;
      });
    },
    // 下载文件
    onDownloadFile(type, name) {
      let _query = {
        name: name
      };
      if (type == 0) {
        getNoDetectZip(_query);
      } else {
        getAbnormalZip(_query);
      }
    },
    // 删除文件
    onDeleteFile(type, name) {
      this.$confirm(
        `确定删除${type == 0 ? "未对齐列表" : "异常列表"}${name}？`,
        "提示",
        {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          confirmButtonClass: "el-button--mini",
          cancelButtonClass: "el-button--mini fr",
          type: "warning"
        }
      ).then(() => {
        if (type == 0) {
          delNoDetectFile(name);
        } else {
          delAbnormalFile(name);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  position: relative;
  height: 100%;
  .common-tool {
    background: #fafbfd;
  }
  .main {
    height: calc(100vh - 166px);
    padding: 8px;
  }
  .el-row {
    display: flex;
    height: 100%;
  }
}
.file-list {
  position: relative;
  height: 100%;
  padding-top: 36px;
  overflow: hidden;
  border-radius: 6px;
  .title {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    background: repeat-x url(~@/assets/title-bg.jpg);
    line-height: 36px;
    padding-left: 12px;
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }
  .box {
    position: relative;
    background: #fbfbfb;
    height: 100%;
    overflow: auto;
    border: 1px solid #dadee1;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }
  .item {
    display: flex;
    padding: 0 10px;
    height: 50px;
    line-height: 54px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    &:nth-child(odd) {
      background: #e5f0fd;
    }
    &:nth-child(even) {
      background: #ffffff;
    }
    &:hover {
      background: #7eb7f1;
      color: #fff;
      .svg-icon,
      .el-button {
        color: #fff;
      }
    }
    .svg-icon {
      height: 50px;
      margin-right: 8px;
      font-size: 26px;
      color: #0fa0ff;
    }
    .el-button {
      float: right;
      height: 50px;
      margin-left: 6px;
      padding: 0;
      font-size: 20px;
      color: #b7c0cc;
    }
  }
  .tip {
    position: absolute;
    top: 50%;
    right: 0;
    left: 0;
    line-height: 100px;
    margin-top: -50px;
    text-align: center;
    font-size: 12px;
    color: #adb1b4;
  }
  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>