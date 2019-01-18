<template>
  <div class="app-container">
    <el-row class="main">
      <!-- 左侧标签库管理 S -->
      <label-library ref="labelLibrary" @change="onMenuChange" />
      <!-- 左侧标签库管理 E -->

      <el-col :span="19" class="right-box">
        <!-- 表单筛选 -->
        <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="onSearch">
          <span>关键字</span>
          <el-form-item prop="keyword">
            <el-input size="mini" @keyup.enter.native="onSearch" placeholder="姓名/证件号" v-model="listQuery.keyword"></el-input>
          </el-form-item>
          <el-form-item prop="imageCount">
            <el-input size="mini" @keyup.enter.native="onSearch" placeholder="底库数" v-model="listQuery.imageCount"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" type="primary" @click="onSearch">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" @click="onResetForm">重置</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" v-if="listQuery.num == 4" type="danger" @click="onEmpty">一键删除陌生人</el-button>
          </el-form-item>
        </el-form>

        <!-- 工具栏 -->
        <div class="common-tool">
          <div class="title" v-if="currentMenuData">
            {{currentMenuData.name}}
            <em>{{currentMenuData.count}}</em>
          </div>
          <div class="right">
            <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
            <el-button class="txt-btn" size="mini" type="text" icon="el-icon-delete" @click="onItemDelete">删除</el-button>
            <div class="separator"></div>
            <el-button class="txt-btn" size="mini" type="text" icon="el-icon-upload" @click="onExportLabelZip">导出人脸包</el-button>
            <div class="separator"></div>
            <el-button-group class="switch">
              <el-button :type="mode===0?'primary':'info'" @click="mode=0" size="mini">
                <svg-icon icon-class="category" />
              </el-button>
              <el-button :type="mode===1?'primary':'info'" @click="mode=1" size="mini">
                <svg-icon icon-class="images" />
              </el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 表格模式 S -->
        <el-table v-show="mode == 0" ref="listTabel" :data="listData.rows" height="calc(100vh - 255px)" v-loading.body="listLoading" highlight-current-row @selection-change="onListChange">
          <el-table-column type="selection" width="50" />
          <el-table-column min-width="80" label="证件照" align="center">
            <template slot-scope="scope">
              <img :src="scope.row.identityImg+'?v='+imgKey" class="pic">
            </template>
          </el-table-column>
          <el-table-column width="180" prop="name" label="姓名/证件号">
            <template slot-scope="scope">
              <div class="identity">
                <label>{{scope.row.name}}</label>
                <p>{{scope.row.identityNo}}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="类别" min-width="110" align="center">
            <template slot-scope="scope">
              <div class="label-box">
                <span class="label-item" v-for="(item,index) in scope.row.labelNames.split(',')" :key="index" :style="{backgroundColor:item.split('|')[1],color:colorBrightness(item.split('|')[1])}">{{item.split('|')[0]}}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="60" prop="sex" label="性别" align="center"></el-table-column>
          <el-table-column min-width="60" prop="age" label="年龄" align="center"></el-table-column>
          <el-table-column fixed="right" width="130" align="center" label="操作">
            <template slot-scope="scope">
              <el-button size="mini" type="success" @click="onItemEdit(scope.row.id)">编辑</el-button>
              <el-button size="mini" type="primary" @click="onOpenLayer(scope.row)">轨迹</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 表格模式 E -->

        <!-- 卡片模式 S -->
        <div class="card-list" v-show="mode == 1">
          <div class="item" :class="{sel: listIds.includes(item.id)}" v-for="item in listData.rows" :key="item.id" @click="$refs.listTabel.toggleRowSelection(item)">
            <div class="pic">
              <img :src="item.identityImg+'?v='+imgKey">
              <div class="label-list">
                <div class="top-label" v-for="(label,index) in item.labelNames.split(',')" :key="index" :style="{zIndex:10-index}">
                  <span :style="{backgroundColor:label.split('|')[1],color:colorBrightness(label.split('|')[1])}">{{label.split('|')[0]}}</span>
                  <i :style="{borderLeftColor:label.split('|')[1]}" class="icon"></i>
                </div>
              </div>
            </div>
            <div class="box">
              <div class="txt">
                <svg-icon icon-class="user" />
                <b class="name">{{item.name}}</b>
                <el-checkbox :value="listIds.includes(item.id)" />
              </div>
              <div class="txt">
                <svg-icon icon-class="credentials" />
                <label>{{item.identityNo}}</label>
              </div>
              <div class="btns">
                <el-button size="mini" @click.stop="onItemEdit(item.id)">编辑</el-button>
                <el-button size="mini" @click.stop="onOpenLayer(item)">轨迹</el-button>
                <el-button size="mini" @click.stop="onItemEdit(item.id, true)">详情</el-button>
              </div>
            </div>
          </div>
        </div>
        <!-- 卡片模式 E -->

        <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total"></el-pagination>
      </el-col>
    </el-row>

    <label-form ref="labelForm" :is-open.sync="isFormDialog" :id="labelFormId" @complete="updateView" :readonly="formReadonly" />

    <!-- 以图搜图 - 弹窗 -->
    <picture-layer ref="pictureLayer" jump />
  </div>
</template>

<script>
import {
  getLabelList,
  postLabel,
  deleteLabel,
  getLabelZip,
  deleteCluster
} from "@/api/faceModule/faceLabel/index";
import { colorBrightness } from "@/utils";

export default {
  name: "face-faceLabel",
  components: {
    LabelForm: () => import("./components/LabelForm"),
    LabelLibrary: () => import("./components/LabelLibrary")
  },
  data() {
    return {
      mode: 0, // 显示切换
      isFormDialog: false, // 控制表单显示
      labelFormId: null, // 当前id
      colorBrightness: colorBrightness, // 色彩亮度判断

      formReadonly: false,

      currentMenuData: [],
      listIds: [],
      listData: {},
      listQuery: {
        offset: 1,
        limit: 15,
        num: null,
        imageCount: null,
        keyword: null,
        communityCode: null
      },
      listLoading: false,
      imgKey: new Date().getTime()
    };
  },
  watch: {
    currentMenuData(val) {
      this.listQuery.num = val.num;
      this.listQuery.communityCode = val.communityCode;

      this.getTableList();
    },
    "listQuery.imageCount"(val) {
      this.$nextTick(() => {
        this.listQuery.imageCount = val.replace(/[^0-9]+/g, "");
      });
    }
  },
  methods: {
    updateView() {
      this.labelFormId = null;

      this.$refs.labelLibrary.menuList();
      this.getTableList();
    },
    // 获取表格数据
    getTableList() {
      this.listLoading = true;
      getLabelList(this.listQuery)
        .then(res => {
          this.listData = res.data;
          this.imgKey = new Date().getTime();
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.listQuery.limit = 15;
      this.getTableList();
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
    // 一键删除所有陌生人标签
    onEmpty(data) {
      this.$confirm("一键删除所有陌生人标签，数据不可恢复，是否继续?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonClass: "el-button--mini",
        cancelButtonClass: "el-button--mini fr",
        type: "warning"
      }).then(() => {
        deleteCluster().then(res => {
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
    // 表单编辑
    onItemEdit(id, isReadonly) {
      isReadonly = isReadonly || false;

      this.labelFormId = id || null;
      this.formReadonly = isReadonly;
      this.$nextTick(() => {
        this.isFormDialog = true;
      });
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
        deleteLabel({
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
            this.updateView();
          }
        });
      });
    },
    // 下载人脸包
    onExportLabelZip() {
      if (!this.listIds.length) {
        this.$notify({
          title: "失败",
          message: "请勾选要下载的人脸底库",
          type: "error",
          duration: 2000
        });
        return;
      }

      getLabelZip({ ids: this.listIds.join(",") }).then(res => {
        let isSuccess = res.status === 200;
        if (!isSuccess) {
          this.$notify({
            title: "失败",
            message: response.message,
            type: "error",
            duration: 2000
          });
          return;
        }

        window.open(res.data);
      });
    },
    // 列表参数重置
    onResetForm() {
      this.$refs.listForm.resetFields();
    },
    // 带单更新
    onMenuChange(data) {
      this.currentMenuData = data;
    },
    // 打开以图搜图
    onOpenLayer(row) {
      this.$refs.pictureLayer.open({
        keyword: row.identityNo,
        image: row.identityImg
      });
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
}
.label-list {
  position: absolute;
  top: 0;
  left: 0;
  padding-left: 2px;
  .top-label {
    position: relative;
    float: left;
    line-height: 18px;
    margin-left: -6px;
    padding-right: 6px;
    overflow: hidden;
    font-size: 12px;
    span {
      display: block;
      padding: 0 2px 0 8px;
    }
    .icon {
      position: absolute;
      top: -9px;
      right: 0;
      width: 0;
      height: 0;
      float: left;
      border-left: 6px solid #fff;
      border-top: 9px solid transparent;
      border-bottom: 18px solid transparent;
      content: "";
    }
  }
}
.right-box {
  .el-button {
    margin-left: 0;
  }
  .el-pagination {
    padding: 10px;
  }
  .identity {
    line-height: 140%;
    label {
      font-size: 14px;
    }
    p {
      color: #9da5af;
    }
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
.el-table {
  .pic {
    display: block;
    width: 50px;
    height: 62px;
    margin: 0 auto;
  }
  .label-box {
    padding: 4px 0 0;
  }
  .label-item {
    display: inline-block;
    height: 22px;
    line-height: 18px;
    padding: 0 3px;
    margin: 0 4px 4px;
    text-align: center;
    border: 2px #fff solid;
    border-radius: 99px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    font-size: 12px;
    color: #fff;
  }
}
.card-list {
  height: calc(100vh - 255px);
  overflow: auto;
  .pic {
    position: relative;
    display: block;
    width: 160px;
    height: 160px;
    overflow: hidden;
    img {
      display: block;
      width: 160px;
      height: 198px;
    }
  }
  .item {
    float: left;
    margin: 10px 0 0 10px;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    border: 1px solid transparent;
    &.sel {
      border-color: #0fa0ff;
    }
    b {
      font-size: 14px;
      color: #333;
    }
    label {
      font-size: 12px;
      color: #9da5af;
    }
    .box {
      width: 160px;
      padding: 6px;
    }
    .txt {
      display: flex;
      width: 100%;
      height: 18px;
      line-height: 18px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      .name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .svg-icon {
      display: inline-block;
      height: 100%;
      margin-right: 4px;
      vertical-align: top;
      color: #b5c0cd;
    }
    .btns {
      margin-top: 4px;
    }
    .el-button {
      padding: 0 10px;
    }
    .el-checkbox {
      float: right;
      margin-left: 4px;
      pointer-events: none;
    }
  }
}
</style>
