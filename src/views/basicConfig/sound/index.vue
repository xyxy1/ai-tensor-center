<template>
  <div class="sound-container">
    <el-row>
      <!-- 左侧列表 S -->
      <el-col :span="5" class="tree-container">
        <div class="title">
          <el-button size="mini" @click="onVoiceUpdate('')" icon="el-icon-plus">添加配置</el-button>
        </div>
        <div class="list">
          <div class="item" :class="{sel:templetQuery.voiceId == item.id}" @click="templetQuery.voiceId = item.id" v-for="item in voiceList" :key="item.id">
            <span>{{item.voiceName}}</span>
            <el-dropdown @command="onCommand($event, item)" class="more">
              <div class="icon">
                <svg-icon icon-class="more" />
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="upd">编辑</el-dropdown-item>
                <el-dropdown-item command="del">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </el-col>
      <!-- 左侧列表 E -->
      <!-- 右侧内容 S -->
      <el-col :span="19">
        <el-form class="form" ref="listForm" :inline="true" :model="templetQuery">
          <el-form-item prop="keyword" label="关键字">
            <el-input size="mini" @keyup.enter.native="onSearch" placeholder="标题/内容" v-model="templetQuery.keyword" />
          </el-form-item>
          <el-form-item>
            <el-button size="mini" type="primary" @click="onSearch">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" @click="onResetForm">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 工具栏 -->
        <div class="common-tool">
          <div class="title">
            提示音管理
            <em>{{voiceTempletList.total?voiceTempletList.total:0}}</em>
          </div>
          <div class="right">
            <el-button class="txt-btn" size="mini" icon="el-icon-plus" type="text" @click="onTempletUpdate('')">添加</el-button>
            <el-button class="txt-btn" size="mini" icon="el-icon-delete" type="text" @click="onItemDelete" style="margin-left:0px">删除</el-button>
          </div>
        </div>
        <el-table :data="voiceTempletList.rows" v-loading="tableLoading" height="calc(100vh - 306px)" @selection-change="onListChange">
          <el-table-column type="selection" width="45" />
          <el-table-column align="center" prop="title" label="标题" />
          <el-table-column align="center" prop="text" label="内容" />
          <el-table-column align="center" prop="crtName" label="创建人" />
          <el-table-column align="center" prop="crtTime" label="创建时间" />
          <el-table-column align="center" label="操作" width="130">
            <template slot-scope="scope">
              <el-button type="success" size="mini" @click="onTempletUpdate(scope.row)">编辑</el-button>
              <audio-button :src="scope.row.url"></audio-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="templetQuery.offset" :page-sizes="[15,30,50]" :page-size="templetQuery.limit" :total="voiceTempletList.total" layout="total, sizes, prev, pager, next, jumper" />
      </el-col>
      <!-- 右侧内容 E -->
    </el-row>

    <!-- 语音配置弹窗 S -->
    <el-dialog :title="voiceQuery.id === null?'新增语音配置':'编辑语音配置'" class="voice-layer" :visible.sync="isVoiceDialog" width="500px">
      <el-form :model="voiceQuery" :rules="voiceRules" ref="voiceForm" label-width="100px">
        <el-form-item label="配置名称" prop="voiceName">
          <el-input v-model="voiceQuery.voiceName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="appId" prop="appId">
          <el-input v-model="voiceQuery.appId" placeholder="请输入appId" />
        </el-form-item>
        <el-form-item label="appKey" prop="appKey">
          <el-input v-model="voiceQuery.appKey" placeholder="请输入appKey" />
        </el-form-item>
        <el-form-item label="secretKey" prop="secretKey">
          <el-input v-model="voiceQuery.secretKey" placeholder="请输入secretKey" />
        </el-form-item>
        <el-form-item label="语速" prop="optionSpd">
          <el-slider v-model.number="voiceQuery.optionSpd" :min="0" :max="9" />
        </el-form-item>
        <el-form-item label="音调" prop="optionPit">
          <el-slider v-model.number="voiceQuery.optionPit" :min="0" :max="9" />
        </el-form-item>
        <el-form-item label="发音人" prop="optionPer">
          <el-radio-group v-model="voiceQuery.optionPer">
            <el-radio label="">普通女</el-radio>
            <el-radio label="0">女声</el-radio>
            <el-radio label="1">男声</el-radio>
            <el-radio label="3">情感合成-度逍遥</el-radio>
            <el-radio label="4" style="margin:5px 0 0 0">情感合成-度丫丫</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="音量" prop="optionVol">
          <el-slider v-model.number="voiceQuery.optionVol" :min="0" :max="15" />
        </el-form-item>
        <el-form-item label="频率" prop="voiceFrequency">
          <el-input v-model="voiceQuery.voiceFrequency" placeholder="请输入频率" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isVoiceDialog = false">取 消</el-button>
        <el-button type="primary" @click="onVoiceSubmit">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 语音配置弹窗 E -->

    <!-- 语音模板弹窗 S -->
    <el-dialog :title="addTempletQuery.id === null?'新增语音模板配置':'编辑语音模板配置'" class="" :visible.sync="isTempletDialog" width="500px">
      <el-form :model="addTempletQuery" :rules="templetRules" ref="templetForm" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="addTempletQuery.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="text">
          <el-input type="textarea" :rows="6" v-model="addTempletQuery.text" placeholder="请输入内容，最多512字" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isTempletDialog = false">取 消</el-button>
        <el-button type="primary" @click="onTempletSubmit">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 语音模板弹窗 E -->
  </div>
</template>
<script>
import {
  getVoiceList,
  postVoice,
  getVoice,
  deleteVoice,
  getVoiceTempletList,
  deleteVoiceTemplet,
  getVoiceTemplet,
  postVoiceTemplet
} from "@/api/basicConfig/sound";
import AudioButton from "@/common/component/AudioButton";

export default {
  name: "base-sound-manager",
  components: {
    AudioButton
  },
  data() {
    return {
      voiceList: [],
      voiceTempletList: {},
      listIds: [],
      voiceQuery: {
        id: null,
        voiceName: null,
        appId: null,
        appKey: null,
        secretKey: null,
        optionSpd: 0,
        optionPit: 0,
        optionPer: "",
        optionVol: 0,
        voiceFrequency: null
      },
      voiceRules: {
        voiceName: { required: true, message: "请输入voiceName" },
        appId: { required: true, message: "请输入appId" },
        appKey: { required: true, message: "请输入appKey" },
        secretKey: { required: true, message: "请输入secretKey" }
      },
      templetRules: {
        title: { required: true, message: "请输入标题" },
        text: { required: true, message: "请输入内容" }
      },
      templetQuery: {
        limit: 15,
        offset: 1,
        keyword: null,
        voiceId: null
      },
      addTempletQuery: {
        id: null,
        voiceId: null,
        title: null,
        text: null
      },
      isVoiceDialog: false,
      isTempletDialog: false,
      tableLoading: false
    };
  },
  watch: {
    "templetQuery.voiceId"() {
      this.getTempletList();
    }
  },
  methods: {
    init() {
      this.initVoiceList(() => {
        this.templetQuery.voiceId = this.voiceList[0].id;
      });
    },
    initVoiceList(cb) {
      getVoiceList().then(res => {
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

        this.voiceList = res.data.rows;

        cb && cb();
      });
    },
    onCommand(command, item) {
      if (command == "upd") {
        this.onVoiceUpdate(item);
      }
      if (command == "del") {
        this.$confirm(`确定删除【${item.voiceName}】？`, "提示", {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          confirmButtonClass: "el-button--mini",
          cancelButtonClass: "el-button--mini fr",
          type: "warning"
        }).then(() => {
          this.voiceId = item.id;
          deleteVoice(this.voiceId).then(res => {
            let isSuccess = res.status == 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "删除成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.isVoiceDialog = false;
              this.initVoiceList();
            }
          });
        });
      }
    },
    // 关键字搜索框
    onSearch() {
      this.templetQuery.offset = 1;
      this.getTempletList();
    },
    // 重置按钮
    onResetForm() {
      this.$refs.listForm.resetFields();
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    // 批量删除
    onItemDelete() {
      if (!this.listIds.length) {
        this.$notify({
          title: "提示",
          message: "请选择需要删除的数据",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.$confirm("此操作将永久删除, 是否继续?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonClass: "el-button--mini",
        cancelButtonClass: "el-button--mini fr",
        type: "warning"
      }).then(() => {
        deleteVoiceTemplet({
          ids: this.listIds
        }).then(res => {
          let isSuccess = res.status === 200;
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "删除成功" : res.message,
            type: isSuccess ? "success" : "error",
            duration: 2000
          });

          if (isSuccess) {
            this.getTempletList();
          }
        });
      });
    },
    getTempletList() {
      this.tableLoading = true;
      getVoiceTempletList(this.templetQuery).then(res => {
        this.tableLoading = false;
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

        this.voiceTempletList = res.data;
      });
    },
    onVoiceUpdate(data) {
      this.isVoiceDialog = true;
      this.$nextTick(() => {
        this.$refs.voiceForm.resetFields();
        if (data) {
          this.voiceQuery.id = data.id;
          getVoice(data.id).then(res => {
            this.voiceQuery = res.data;
          });
        } else {
          this.voiceQuery.id = null;
        }
      });
    },
    onTempletUpdate(data) {
      this.addTempletQuery.voiceId = this.templetQuery.voiceId;
      this.isTempletDialog = true;
      this.$nextTick(() => {
        this.$refs.templetForm.resetFields();
        if (data) {
          getVoiceTemplet(data.id).then(res => {
            this.addTempletQuery = res.data;
          });
        } else {
          this.addTempletQuery.id = null;
        }
      });
    },
    onVoiceSubmit() {
      this.$refs.voiceForm.validate(vaild => {
        if (!vaild) return false;

        postVoice(this.voiceQuery).then(res => {
          let isSuccess = res.status === 200;
          // 提示处理
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "提交成功" : res.message,
            type: isSuccess ? "success" : "error",
            duration: 2000
          });
          this.isVoiceDialog = false;
          this.initVoiceList();
        });
      });
    },
    onTempletSubmit() {
      this.$refs.templetForm.validate(valid => {
        if (!valid) return false;

        postVoiceTemplet(this.addTempletQuery).then(res => {
          let isSuccess = res.status === 200;
          // 提示处理
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "提交成功" : res.message,
            type: isSuccess ? "success" : "error",
            duration: 2000
          });
          this.isTempletDialog = false;

          this.getTempletList();
        });
      });
    },
    onListPaging(val) {
      this.templetQuery.offset = val;
      this.getTempletList();
    },
    onListLimit(val) {
      this.templetQuery.limit = val;
      this.getTempletList();
    }
  }
};
</script>

<style lang="scss" scoped>
.sound-container {
  height: 100%;
  .el-row {
    height: 100%;
    & > .el-col {
      min-height: 100%;
    }
  }
  .form {
    background: #fafbfd;
    height: 46px;
    line-height: 46px;
    overflow: hidden;
    font-size: 0;
    span {
      display: inline-block;
      padding-left: 10px;
      text-align: right;
      font-size: 13px;
      color: #3f4041;
    }
    .el-form-item {
      height: auto;
      line-height: 100%;
      margin: 4px 0 0 6px;
      font-size: 0;
    }
    .el-select {
      width: 100px;
    }
    .el-input {
      width: 200px;
    }
  }
}
.tree-container {
  background: #fafbfd;
  border-right: 1px solid #e1e1e1;
  .title {
    height: 46px;
    line-height: 46px;
    padding: 0 10px;
    font-size: 14px;
    color: #333;
    .el-button {
      width: 100%;
    }
  }
  .list {
    border-top: 1px solid #e1e1e1;
    font-size: 13px;
    color: #333;
    .item {
      position: relative;
      display: flex;
      padding: 0 10px;
      height: 39px;
      line-height: 38px;
      border-bottom: 1px solid #edeff3;
      cursor: pointer;
      .el-button {
        float: right;
        height: 38px;
        margin-left: 6px;
        padding: 0;
        font-size: 16px;
      }
      &:hover {
        background: #e7eff8;
      }
      &.sel {
        background: #d5e6f9;
      }
    }
    span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
.voice-layer {
  .el-slider {
    padding: 0 8px;
  }
  .el-radio + .el-radio {
    margin-left: 16px;
  }
}
.el-pagination {
  margin: 10px 0px;
  padding-left: 10px;
}
.audio-button {
  margin-left: 10px;
  height: 26px !important;
  width: 26px !important;
}
.el-form-item {
  margin-right: 3px;
}
</style>
