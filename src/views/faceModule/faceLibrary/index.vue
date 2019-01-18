<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="代码" v-model="listQuery.num"> </el-input>
      <el-button class="filter-item" type="primary" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="edit">添加</el-button>
    </div>
    <el-table :key='tableKey' :data="list" height="calc(100vh - 238px)" v-loading.body="listLoading" highlight-current-row style=" width: 100%;">
      <el-table-column width="80px" align="center" label="代码">
        <template slot-scope="scope">
          <span>{{scope.row.num}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" align="center" label="名称"></el-table-column>
      <el-table-column prop="canDangleAfterCn" align="center" label="是否可被尾随"></el-table-column>
      <el-table-column prop="frameRgb" width="150px" align="center" label="边框颜色"></el-table-column>
      <el-table-column prop="frameIndex" align="center" label="边框顺序"></el-table-column>
      <el-table-column prop="crtName" align="center" label="创建人"></el-table-column>
      <el-table-column prop="crtTime" width="160px" align="center" label="创建时间"></el-table-column>
      <el-table-column prop="udpName" align="center" label="修改人"></el-table-column>
      <el-table-column prop="updTime" width="160px" align="center" label="修改时间"></el-table-column>
      <el-table-column fixed="right" width="160px" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="small" type="success" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="代码" prop="num">
          <el-input v-model="form.num" placeholder="请输入代码,且必须是2的N次方"></el-input>
          <!--新增的时候自动生成2的n次方，编辑的时候不可修改-->
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="是否可被尾随">
          <el-switch v-model="form.canDangleAfter" :active-value="1" :inactive-value="0" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="边框颜色">
          <el-input v-model="form.frameRgb" placeholder="rgb用逗号隔开,eg:255,255,0"></el-input>
        </el-form-item>
        <el-form-item label="边框顺序">
          <el-input v-model="form.frameIndex" placeholder="请输入边框顺序"></el-input>
        </el-form-item>
        <el-form-item label="语音顺序">
          <el-input v-model="form.voiceTempletIndex" placeholder="请输入语音顺序"></el-input>
        </el-form-item>
        <el-form-item label="语音模板">
          <el-input v-model="form.voiceTempletTitle" @focus="onOpenVoiceLayer" placeholder="点击添加语音模板" readonly>
            <audio-button slot="append" :src="form.voiceTempletUrl" v-if="form.voiceTempletUrl"></audio-button>
          </el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5}" placeholder="请输入备注信息" v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel('form')">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="create('form')">确 定</el-button>
        <el-button v-else type="primary" @click="update('form')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="选择语音模板" class="voice-layer" :visible.sync="dialogVoiceVisible" width="1000px">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-card>
            <div class="list">
              <div class="item" :class="{sel:templetQuery.voiceId}" v-for="item in voiceList" :key="item.id">
                <span>{{item.voiceName}}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="17">
          <el-table :data="voiceTempletList.rows" v-loading="tableTempletLoading" height="calc(100vh - 460px)" @cell-dblclick="onConfirmTemplet" @current-change="onTableChange">
            <el-table-column align="center" prop="title" label="标题"></el-table-column>
            <el-table-column align="center" prop="text" label="内容"></el-table-column>
            <el-table-column align="center" prop="crtName" label="创建人"></el-table-column>
            <el-table-column align="center" prop="crtTime" label="创建时间"></el-table-column>
            <el-table-column align="center" label="操作" width="60">
              <template slot-scope="scope">
                <audio-button :src="scope.row.url"></audio-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="templetQuery.offset" :page-sizes="[15,100,250]" :page-size="templetQuery.limit" :total="voiceTempletList.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVoiceVisible = false">取 消</el-button>
        <el-button type="primary" @click="onConfirmTemplet">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  page,
  addObj,
  getFullObj,
  delObj,
  putObj
} from "@/api/faceModule/faceLibrary/index";
import AudioButton from "@/common/component/AudioButton";
import { mapGetters } from "vuex";
import { getVoiceList, getVoiceTempletList } from "@/api/basicConfig/sound";
export default {
  name: "face-faceLibrary",
  data() {
    return {
      form: {
        num: null,
        name: null,
        frameRgb: null,
        frameIndex: null,
        compareFlag: null,
        voiceTempletId: null,
        voiceTempletIndex: null,
        warnIndex: null,
        remark: null
      },
      rules: {
        name: [
          {
            required: true,
            message: "请输入标签名称",
            trigger: "blur"
          },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur"
          }
        ]
      },
      listQuery: {
        num: null
      },
      list: null,
      total: null,
      listLoading: true,
      dialogFormVisible: false,
      dialogVoiceVisible: false,
      dialogStatus: "",
      groupTypeManager_btn_edit: false,
      groupTypeManager_btn_add: false,
      textMap: {
        update: "编辑",
        create: "创建"
      },
      tableKey: 0,

      // 语音弹窗
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
      currentRow: null
    };
  },
  created() {
    this.getList();
    this.groupTypeManager_btn_edit = this.elements["groupTypeManager:btn_edit"];
    this.groupTypeManager_btn_add = this.elements["groupTypeManager:btn_add"];
  },
  computed: {
    ...mapGetters(["elements"])
  },
  methods: {
    getList() {
      this.listLoading = true;
      page(this.listQuery).then(response => {
        this.list = response.data.rows;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },
    getTempletList() {
      this.currentRow = null;
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
    handleFilter() {
      this.getList();
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
    },
    handleUpdate(row) {
      getFullObj(row.id).then(response => {
        this.form = response.data;
        this.dialogFormVisible = true;
        this.dialogStatus = "update";
      });
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        delObj(row.id).then(response => {
          if (response.status === 200) {
            this.getList();
            this.$notify({
              title: "成功",
              message: "删除成功",
              type: "success",
              duration: 2000
            });
          }
          if (response.status === 30101) {
            this.getList();
            this.$notify({
              title: "失败",
              message: "初始化配置,不允许删除",
              type: "error",
              duration: 2000
            });
          }
          // const index = this.list.indexOf(row);
          // this.list.splice(index, 1);
        });
      });
    },
    create(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          addObj(this.form).then(res => {
            let isSuccess = res.status === 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "创建成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            this.getList();
            this.dialogFormVisible = false;
          });
        } else {
          return false;
        }
      });
    },
    cancel(formName) {
      this.dialogFormVisible = false;
      this.$refs[formName].resetFields();
    },
    update(formName) {
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false;

          delete this.form.voiceTempletTitle;
          delete this.form.voiceTempletUrl;

          putObj(this.form.id, this.form).then(response => {
            this.dialogFormVisible = false;
            if (response.status === 200) {
              this.getList();
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000
              });
            }
            if (response.status === 30101) {
              this.$notify({
                title: "失败",
                message: "陌生人不允许修改",
                type: "error",
                duration: 2000
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    resetTemp() {
      this.form = {
        num: null,
        name: null,
        warnFlag: 0,
        compareFlag: 0
      };
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
        this.dialogVoiceVisible = true;

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
    onConfirmTemplet() {
      if (this.currentRow === null) {
        this.$notify({
          title: "提示",
          message: "请先选择一个语音模板",
          type: "warning",
          duration: 2000
        });
        return;
      }
      // 更新内容
      this.form.voiceTempletId = this.currentRow.id;
      this.form.voiceTempletTitle = this.currentRow.title;
      this.form.voiceTempletUrl = this.currentRow.url;
      // 关闭弹窗
      this.dialogVoiceVisible = false;
    },
    onTableChange(row) {
      this.currentRow = row;
    }
  },
  components: {
    AudioButton
  }
};
</script>

<style lang="scss" scoped>
.voice-layer {
  .list {
    margin-top: 10px;
  }
  .item {
    display: flex;
    padding: 0 6px;
    line-height: 30px;
    border-bottom: 1px #ccc dashed;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    &:hover {
      background-color: #f5f7fa;
    }
    &.sel {
      background-color: #f0f9f5;
    }
  }
  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .el-pagination {
    margin-top: 10px;
  }
}
.el-slider {
  padding: 0 8px;
}
</style>
