<template>
  <div class="app-container">
    <!-- 表单筛选 -->
    <el-form class="form" @keyup.enter.native="onSearch">
      <span>关键字</span>
      <el-input size="mini" @keyup.enter.native="onSearch" placeholder="车牌号" v-model="listQuery.condition"></el-input>
      <span>时间</span>
      <el-date-picker size="mini" v-model="pickerValue" type="datetimerange" :picker-options="pickerOptions" range-separator="|" @change="onPickerChange" start-placeholder="开始日期" end-placeholder="结束日期" align="center" :clearable="false" :editable="false" />
      <el-button size="mini" type="primary" @click="onSearch">查询</el-button>
      <el-button size="mini" @click="onResetForm">重置</el-button>
    </el-form>

    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        车辆抓拍
        <em>{{listTableData.total?listTableData.total:0}}</em>
      </div>
      <div class="right">
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
    <el-table ref="listTabel" :data="listTableData.rows" height="calc(100vh - 255px)" v-loading.body="listTableLoading" highlight-current-row @selection-change="onListChange">
      <!-- <el-table-column type="selection" width="50" /> -->
      <el-table-column label="抓拍照片" align="center" width="140">
        <template slot-scope="scope">
          <a @click="onLookPicture(scope.row.passImage)">
            <img-show width="100px" txt="暂无头像" :img-src="scope.row.passImage" class="pic"></img-show>
          </a>
        </template>
      </el-table-column>
      <el-table-column prop="plateNo" label="车牌号" align="center" />
      <el-table-column label="时间" align="center">
        <template slot-scope="scope">{{moment(scope.row.passTime,'YYYYMMDDHHmmss').format("YYYY-MM-DD HH:mm:ss")}}</template>
      </el-table-column>
      <el-table-column prop="parkInfoName" label="车场名称" align="center" />
      <el-table-column prop="passPlace" label="地点" align="center" />
      <el-table-column fixed="right" min-width="100" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onLookPicture(scope.row.passImage)">查看大图</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格模式 E -->

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total" />

    <!-- 图片弹窗 -->
    <el-dialog title="背景大图" :visible.sync="isBgDialog">
      <img :src="rowBgImg" class="w100">
    </el-dialog>
  </div>
</template>
<script>
import moment from "moment";
import { pickerOptions } from "@/utils";
import { getCarSnapList } from "@/api/carManage/carSnap";

export default {
  name: "carSnap",
  data: () => ({
    mode: 0,
    moment: moment,

    isFormDialog: false,
    form: {
      id: null,
      communityCode: null,
      name: null,
      lng: null,
      lat: null
    },
    rules: {
      communityCode: { required: true, message: "社区编号不能为空" },
      name: { required: true, message: "停车场名称不能为空" },
      lng: { required: true, message: "经纬度不能为空" }
    },

    listQuery: {
      condition: "",
      startTime: moment()
        .subtract(1, "d")
        .format("YYYYMMDDHHmmss"),
      endTime: moment().format("YYYYMMDDHHmmss"),
      offset: 1,
      limit: 15
    },
    listTableData: {},
    listTableLoading: false,
    listIds: [],

    isBgDialog: false, // 控制背景图显示
    rowBgImg: null,

    pickerValue: [moment().subtract(1, "d"), moment()],
    pickerOptions: pickerOptions
  }),
  created() {
    this.getTableList();
  },
  activated() {
    if (this.$route.params.data) {
      this.listQuery.condition = this.$route.params.data;
      this.getTableList();
    }
  },
  methods: {
    // 获取表格数据
    getTableList() {
      this.listTableLoading = true;

      getCarSnapList(this.listQuery)
        .then(res => {
          if (res.status === 200) {
            this.listTableData = res.data;
          }
        })
        .finally(err => {
          this.listTableLoading = false;
        });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.listQuery.limit = 15;
      this.getTableList();
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
        // this.$store
        //   .dispatch("camera/remove", { ids: this.listIds })
        //   .then(res => {
        //     let isSuccess = res.status === 200;
        //     this.$notify({
        //       title: isSuccess ? "成功" : "失败",
        //       message: isSuccess ? "删除成功" : res.message,
        //       type: isSuccess ? "success" : "error",
        //       duration: 2000
        //     });
        //     if (isSuccess) {
        //       this.updateView();
        //     }
        //   });
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
      this.listQuery = {
        condition: "",
        startTime: moment()
          .subtract(1, "d")
          .format("YYYYMMDDHHmmss"),
        endTime: moment().format("YYYYMMDDHHmmss"),
        offset: 1,
        limit: 15
      };
    },
    // 日期选择器变更
    onPickerChange(date) {
      if (!date) return;
      this.listQuery.startTime = moment(date[0]).format("YYYYMMDDHHmmss");
      this.listQuery.endTime = moment(date[1]).format("YYYYMMDDHHmmss");
    },
    // 查看大图
    onLookPicture(img) {
      this.rowBgImg = img;
      this.isBgDialog = true;
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  position: relative;
  height: 100%;
  .w100 {
    width: 100%;
  }
  .m0 {
    margin: 0;
  }
  .form {
    background: #fafbfd;
    height: 46px;
    line-height: 46px;
    overflow: hidden;
    font-size: 0;
    & > * {
      margin-right: 6px;
    }
    span {
      display: inline-block;
      padding: 0 2px 0 10px;
      text-align: right;
      font-size: 13px;
      color: #3f4041;
    }
    .el-date-editor {
      width: 330px;
    }
    .el-select {
      width: 100px;
    }
    .el-input {
      width: 180px;
    }
    .picture-search {
      width: 140px;
    }
    .el-button {
      margin-left: 0;
    }
  }
  .img-show {
    display: block;
    margin: 0 auto;
  }
  .el-pagination {
    padding: 10px;
  }
}
</style>