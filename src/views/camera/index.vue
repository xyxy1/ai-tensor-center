<template>
  <div class="app-container">
    <el-row class="main">
      <server-menu ref="serverMenu" @change="onMenuChange" />

      <el-col :span="19" class="right-box">
        <!-- 表单筛选 -->
        <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="getTableList">
          <span>关键字</span>
          <el-form-item prop="keyword">
            <el-input size="mini" @keyup.enter.native="getTableList" placeholder="名称/代码" v-model="listQuery.keyword"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" type="primary" @click="getTableList">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" @click="onResetForm">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 工具栏 -->
        <div class="common-tool">
          <div class="title">
            摄像头
            <em>{{listData.total?listData.total:0}}</em>
          </div>
          <div class="right">
            <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
            <el-button class="txt-btn" size="mini" type="text" icon="el-icon-delete" @click="onItemDelete">删除</el-button>
          </div>
        </div>

        <!-- 表格模式 S -->
        <el-table ref="listTabel" :data="listData.rows" height="calc(100vh - 255px)" v-loading.body="listLoading" highlight-current-row @selection-change="onListChange">
          <el-table-column type="selection" width="50" />
          <el-table-column width="90px" align="center" label="照片">
            <template slot-scope="scope">
              <div class="pic" @click="onLookPicture(scope.row)">
                <img-show height="50px" txt="暂无图片" :img-src="scope.row.cameraImageUrl" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="姓名/品牌" width="160">
            <template slot-scope="scope">
              <div class="info">
                <label>{{scope.row.cameraName}}</label>
                <p>{{scope.row.cameraBrand}}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="cameraCode" label="代码" />
          <el-table-column label="WebServer" width="90">
            <template slot-scope="scope">
              <a :href="scope.row.cameraUrl" target="_blank">点击跳转</a>
            </template>
          </el-table-column>
          <el-table-column prop="cameraMode" label="读取方式" />
          <el-table-column prop="cameraStatusCn" label="状态" width="60" />
          <el-table-column prop="cameraAbleCn" label="是否启用" width="80" />
          <el-table-column fixed="right" width="160px" align="center" label="操作">
            <template slot-scope="scope">
              <el-button size="small" type="success" @click="onItemEdit(scope.row.id)">编辑</el-button>
              <el-button size="small" type="primary" @click="onTest(scope.row)">闭合测试</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 表格模式 E -->

        <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total"></el-pagination>
      </el-col>
    </el-row>

    <!-- 表单弹窗 -->
    <camera-form :is-open.sync="isFormDialog" :id="cameraFormId" :terminal-id="listQuery.terminalId" @complete="updateView" />

    <!-- 图片弹窗 -->
    <el-dialog title="背景大图" :visible.sync="isBgDialog">
      <img :src="rowBgImg" class="w100">
    </el-dialog>
  </div>
</template>
<script>
import { getTest } from "@/api/camera/index";

export default {
  name: "district-camera",
  components: {
    ServerMenu: () => import("./components/ServerMenu"),
    CameraForm: () => import("./components/CameraForm")
  },
  data: () => ({
    isFormDialog: false, // 控制表单显示
    cameraFormId: null,

    isBgDialog: false, // 控制背景图显示
    rowBgImg: null,

    listQuery: {
      offset: 1,
      limit: 15,
      terminalId: null,
      keyword: null
    },
    listIds: [],
    listData: {},
    listLoading: false
  }),
  created() {},
  methods: {
    updateView() {
      this.cameraFormId = null;
      this.$refs.serverMenu.menuList();
    },
    onMenuChange(row) {
      this.listQuery.terminalId = row.terminalId;
      this.getTableList();
    },
    // 获取表格数据
    getTableList() {
      this.listLoading = true;

      this.$store
        .dispatch("camera/query", this.listQuery)
        .then(res => {
          if (res.status === 200) {
            this.listData = res.data;
          }
        })
        .finally(err => {
          this.listLoading = false;
        });
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    // 分页更新
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getTableList();
    },
    // 分页更新
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    },
    // 列表参数重置
    onResetForm() {
      this.$refs.listForm.resetFields();
      this.getTableList();
    },
    onItemEdit(id) {
      this.cameraFormId = id || null;
      this.$nextTick(() => {
        this.isFormDialog = true;
      });
    },
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
        this.$store
          .dispatch("camera/remove", { ids: this.listIds })
          .then(res => {
            let isSuccess = res.status === 200;
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "删除成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.updateView();
            }
          });
      });
    },
    // 闭合测试
    onTest(data) {
      getTest(data.id).then(response => {
        this.$message({
          type: "success",
          message: response.data
        });
      });
    },
    // 查看大图
    onLookPicture(data) {
      this.rowBgImg = data.bgImg;
      this.isBgDialog = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container,
.main {
  height: 100%;
  & > .el-col {
    min-height: 100%;
  }
  .w100 {
    width: 100%;
  }
}
.right-box {
  .el-button {
    margin-left: 0;
  }
  .el-pagination {
    padding: 10px;
  }
  .info {
    line-height: 140%;
    label {
      font-size: 14px;
    }
    p {
      color: #9da5af;
    }
  }
  a {
    font-size: 13px;
    color: #3a8dea;
  }
}
.form {
  background: #fafbfd;
  height: 46px;
  line-height: 46px;
  padding: 0 12px;
  span {
    display: inline-block;
    margin-right: 8px;
    vertical-align: top;
    font-size: 13px;
    color: #3f4041;
  }
  .el-form-item {
    height: auto;
    line-height: 100%;
    margin: 4px 0 0;
    font-size: 0;
  }
}
</style>