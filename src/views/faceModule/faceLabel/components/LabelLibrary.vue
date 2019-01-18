<template>
  <el-col :span="5" class="label-library">
    <div class="title">
      <b>人脸库</b>
      <el-button size="mini" @click="openFormDialog()">新增人脸库</el-button>
    </div>
    <ul v-if="menuData" class="menu">
      <!-- <li class="menu-item">
        <div class="box">
          <svg-icon icon-class="groupFill" />
          <span>全部</span>
          <div class="total">{{menuData.labelCount}}</div>
        </div>
      </li> -->
      <li class="menu-item" v-for="(item,index) in menuData.labelStatisVOS" :key="item.num" :class="{sel: currentRow.num == item.num}" @click="onUpdataMenu(item,index)">
        <div class="box">
          <svg-icon icon-class="groupFill" />
          <span>{{item.name}}</span>
          <div class="total">{{item.count}}</div>
        </div>
        <el-dropdown @command="onCommand" class="more">
          <div class="icon">
            <svg-icon icon-class="more" />
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="upd">编辑</el-dropdown-item>
            <el-dropdown-item command="del">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </li>
    </ul>

    <!-- 编辑人脸库弹层 S -->
    <el-dialog :title="formType=='add'?'新增人脸库':'编辑人脸库'" class="form-layer" :visible.sync="isFormDialog" width="400px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="人脸库名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入人脸库名称"></el-input>
        </el-form-item>
        <el-form-item label="标识名称" prop="shortName">
          <el-input v-model="form.shortName" placeholder="最多输入两个汉字"></el-input>
        </el-form-item>
        <el-form-item label="标识颜色" prop="color">
          <el-color-picker v-model="form.color"></el-color-picker>
          <div class="tip">非重要人员建议不要使用红色</div>
        </el-form-item>
        <el-form-item label="是否可被尾随" prop="canDangleAfter">
          <el-switch v-model="form.canDangleAfter" :active-value="1" :inactive-value="0" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="语音顺序" prop="voiceTempletIndex">
          <el-input v-model="form.voiceTempletIndex" placeholder="请输入语音顺序"></el-input>
        </el-form-item>
        <el-form-item label="语音模板" prop="voiceTempletTitle">
          <el-input v-model="form.voiceTempletTitle" @focus="onOpenVoiceLayer" placeholder="点击添加语音模板" readonly>
            <audio-button slot="append" :src="form.voiceTempletUrl" v-if="form.voiceTempletUrl"></audio-button>
          </el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" resize="none" :autosize="{ minRows: 3 }" placeholder="请输入备注信息" v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="onUpdate()">确 定</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 编辑人脸库弹层 E -->

    <!-- 选择语音模板 S -->
    <el-dialog title="选择语音模板" class="voice-layer body0" :visible.sync="isVoiceVisible" width="1000px">
      <el-row>
        <el-col :span="6">
          <ul>
            <li class="item" :class="{sel:templetQuery.voiceId == item.id}" v-for="item in voiceList" :key="item.id" @click="onVoiceListChange(item.id)">{{item.voiceName}}</li>
          </ul>
        </el-col>
        <el-col :span="18">
          <el-table :data="voiceTempletList.rows" v-loading="tableTempletLoading" height="calc(100vh - 460px)" @cell-dblclick="onConfirmTemplet" @current-change="onTableChange">
            <el-table-column align="center" prop="title" label="标题" />
            <el-table-column align="center" prop="text" label="内容" />
            <!-- <el-table-column align="center" prop="crtName" label="创建人" />
            <el-table-column align="center" prop="crtTime" label="创建时间" /> -->
            <el-table-column align="center" label="操作" width="60">
              <template slot-scope="scope">
                <audio-button :src="scope.row.url"></audio-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="templetQuery.offset" :page-sizes="[15,100,250]" :page-size="templetQuery.limit" :total="voiceTempletList.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
        </el-col>
      </el-row>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onConfirmTemplet">确 定</el-button>
        <el-button size="mini" @click="isVoiceVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 选择语音模板 E -->

  </el-col>
</template>
<script>
import {
  getLabelLibraryList,
  postLabelLibrary,
  deleteLabelLibrary,
  putLabelLibrary,
  getLabelLibrary
} from "@/api/faceModule/faceLabel/index";
import { getVoiceList, getVoiceTempletList } from "@/api/basicConfig/sound";

export default {
  name: "labelLibrary",
  data: () => ({
    menuData: null,
    currentRow: null,
    currentIndex: 0,

    // 表单弹窗
    isFormDialog: false,
    formType: "add",
    form: {
      name: null,
      color: "#c7e09c",
      shortName: null,
      canDangleAfter: null,
      voiceTempletId: null,
      voiceTempletIndex: null,
      remark: null
    },
    rules: {
      name: [
        {
          required: true,
          message: "人脸库名称不能为空",
          trigger: "blur"
        }
      ],
      shortName: [
        {
          required: true,
          message: "标识名称不能为空",
          trigger: "blur"
        },
        {
          min: 1,
          max: 2,
          message: "最多输入两个汉字",
          trigger: "blur"
        }
      ]
    },

    // 语音弹窗
    isVoiceVisible: false,
    voiceList: [],
    templetQuery: {
      limit: 15,
      offset: 1,
      text: null,
      title: null,
      voiceId: null
    },
    voiceTempletList: {},
    tableTempletLoading: false,
    currentVoiceRow: null
  }),
  watch: {
    menuData(val) {
      if (this.menuData) {
        this.currentRow = this.menuData.labelStatisVOS[this.currentIndex];
        this.$emit("change", this.currentRow);
      }
    }
  },
  created() {
    this.menuList();
  },
  methods: {
    menuList() {
      getLabelLibraryList().then(res => {
        if (res.status == 200) {
          this.menuData = res.data;
        }
      });
    },
    onUpdataMenu(row, index) {
      this.currentRow = row;
      this.currentIndex = index;

      this.$emit("change", this.currentRow);
    },
    // 人脸库更多操作
    onCommand(command) {
      if (command == "del") {
        this.$confirm(`确定删除人脸库【${this.currentRow.name}】？`, "提示", {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          confirmButtonClass: "el-button--mini",
          cancelButtonClass: "el-button--mini fr",
          type: "warning"
        }).then(() => {
          deleteLabelLibrary(this.currentRow.id).then(res => {
            let isSuccess = res.status === 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "删除成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.currentIndex = 0;
              this.menuList();
            }
          });
        });
      }
      if (command == "upd") {
        this.formType = "upd";
        getLabelLibrary(this.currentRow.id).then(res => {
          if (res.status == 200) {
            this.openFormDialog(res.data);
          }
        });
      }
    },
    openFormDialog(data) {
      this.isFormDialog = true;
      this.$nextTick(() => {
        this.$refs.form.resetFields();
        if (data) {
          this.form = data;
        }
      });
    },
    onUpdate() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 添加标签库
          if (this.formType == "add") {
            postLabelLibrary(this.form).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "新增成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              this.menuList();
              this.isFormDialog = false;
            });
          }
          // 修改标签库
          if (this.formType == "upd") {
            putLabelLibrary(this.form.id, this.form).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "修改成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              this.menuList();
              this.isFormDialog = false;
            });
          }
        }
      });
    },

    /* 以下均为语音模板控制 */
    getTempletList() {
      this.currentVoiceRow = null;
      this.tableTempletLoading = true;
      getVoiceTempletList(this.templetQuery).then(res => {
        this.tableTempletLoading = false;
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
    onOpenVoiceLayer() {
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
        this.templetQuery.voiceId = this.voiceList[0].id;
        this.isVoiceVisible = true;

        this.getTempletList();
      });
    },
    onListPaging(val) {
      this.templetQuery.offset = val;
      this.getTempletList();
    },
    onListLimit(val) {
      this.templetQuery.limit = val;
      this.getTempletList();
    },
    onVoiceListChange(id) {
      this.templetQuery.voiceId = id;
      this.getTempletList();
    },
    onConfirmTemplet() {
      if (this.currentVoiceRow === null) {
        this.$notify({
          title: "提示",
          message: "请先选择一个语音模板",
          type: "warning",
          duration: 2000
        });
        return;
      }
      // 更新内容
      this.form.voiceTempletId = this.currentVoiceRow.id;
      this.form.voiceTempletTitle = this.currentVoiceRow.title;
      this.form.voiceTempletUrl = this.currentVoiceRow.url;
      // 关闭弹窗
      this.isVoiceVisible = false;
    },
    onTableChange(row) {
      this.currentVoiceRow = row;
    }
    /* 以上均为语音模板控制 */
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
    padding: 0 16px 0 10px;
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

.form-layer {
  .el-color-picker {
    vertical-align: top;
  }
  .tip {
    line-height: 100%;
    margin-top: 6px;
    font-size: 12px;
    color: #aaa;
  }
}

.voice-layer {
  .el-row {
    display: flex;
  }
  .el-pagination {
    padding: 10px;
  }
  ul {
    background: #fafbfd;
    height: 100%;
    border-right: 1px solid #e5e5e5;
  }
  li {
    line-height: 36px;
    padding: 0 10px 0 20px;
    border-bottom: 1px solid #edeff3;
    font-size: 14px;
    color: #333;
    &.sel {
      background: #0fa0ff;
      border-color: #0fa0ff;
      color: #fff;
    }
  }
}
</style>


