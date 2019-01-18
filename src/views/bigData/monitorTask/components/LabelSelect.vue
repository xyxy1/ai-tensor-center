<template>
  <div class="label-select">
    <div class="pic-list">
      <div class="item" v-for="(item,index) in updateData" :key="index" v-if="item.objectId">
        <img :src="item.identityImg">
        <i class="el-icon-delete" @click="onDelete(item,index)"></i>
      </div>
      <i class="el-icon-plus" @click="isLabelDialog = true"></i>
    </div>

    <!-- 人员选择弹窗 -->
    <el-dialog title="选择布控个体" class="label-layer body0" :visible.sync="isLabelDialog" width="700px" append-to-body>
      <div class="main">
        <!-- 表单筛选 -->
        <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="onSearch">
          <span>关键字</span>
          <el-form-item prop="keyword">
            <el-input size="mini" @keyup.enter.native="onSearch" placeholder="姓名/证件号" v-model="listQuery.keyword" />
          </el-form-item>
          <span>人脸库</span>
          <el-form-item prop="num">
            <el-select size="mini" v-model="labelSelect" placeholder="全部" multiple collapse-tags>
              <el-option v-for="label in labelTypeData" :key="label.num" :label="label.label" :value="label.num" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" type="primary" @click="onSearch">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" @click="onResetForm">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 表格模式 S -->
        <el-table ref="listTabel" :data="listData.rows" height="calc(100vh - 500px)" row-key="id" v-loading.body="listLoading" highlight-current-row @selection-change="onListChange">
          <el-table-column type="selection" width="50" reserve-selection />
          <el-table-column width="80" label="证件照" align="center">
            <template slot-scope="scope">
              <img :src="scope.row.identityImg" class="pic">
            </template>
          </el-table-column>
          <el-table-column width="180" prop="name" label="姓名/证件号">
            <template slot-scope="scope">
              <div class="identity txt">
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
          <el-table-column width="80" prop="sex" label="性别" align="center"></el-table-column>
          <el-table-column width="80" prop="age" label="年龄" align="center"></el-table-column>
        </el-table>
        <!-- 表格模式 E -->
        <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total"></el-pagination>
      </div>

      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">确定</el-button>
        <el-button size="mini" @click="isLabelDialog = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getLabelList, getLabelType } from "@/api/faceModule/faceLabel/index";

export default {
  props: {
    value: {
      type: Array
    }
  },
  data: () => ({
    isLabelDialog: false,
    labelData: [],
    labelArr: [],
    updateData: [],

    labelTypeData: [],
    labelSelect: [],

    listSelect: [],
    listData: {},
    listQuery: {
      offset: 1,
      limit: 15,
      num: null,
      keyword: null
    },
    listLoading: false
  }),
  watch: {
    value(val) {
      this.updateData = val;
    },
    updateData(val) {
      this.$emit("input", val);
    },
    isLabelDialog(val) {
      if (val) {
        this.$nextTick(() => {
          this.onResetForm();
          this.getTableList();
          this.$refs.listTabel.clearSelection();
        });
      }
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      getLabelType().then(res => {
        this.labelTypeData = res.data.rows;
      });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.listQuery.limit = 15;
      this.getTableList();
    },
    // 获取表格数据
    getTableList() {
      this.listLoading = true;
      this.listQuery.num = this.labelSelect.join(",");
      getLabelList(this.listQuery)
        .then(res => {
          this.listData = res.data;
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    // 选择人员保存
    onSubmit() {
      let filterArr = this.updateData.map(item => item.objectId);
      let newArr = this.listSelect
        .filter(item => !filterArr.includes(item.id))
        .map(item => {
          return {
            objectId: item.id,
            name: item.name,
            identityImg: item.identityImg
          };
        });

      this.updateData = this.updateData.concat(newArr);
      this.isLabelDialog = false;
    },
    // 删除人员
    onDelete(row, index) {
      this.$set(this.updateData, index, {
        id: row.id
      });
    },
    // 列表参数重置
    onResetForm() {
      this.labelSelect = [];
      this.$refs.listForm.resetFields();
    },
    // 更新列表选中
    onListChange(val) {
      this.listSelect = val;
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
    }
  }
};
</script>
<style lang="scss" scoped>
.label-select {
  .pic-list {
    background: #f3f4f5;
    padding: 10px 10px 0;
    overflow: hidden;
    border-radius: 8px;
    border: 1px #e1e4e6 solid;
    .el-icon-plus {
      float: left;
      background-color: #fbfdff;
      width: 48px;
      height: 48px;
      line-height: 46px;
      margin-bottom: 10px;
      border: 1px dashed #c0ccda;
      border-radius: 6px;
      text-align: center;
      font-size: 26px;
      cursor: pointer;
    }
    .item {
      position: relative;
      float: left;
      width: 48px;
      height: 48px;
      margin: 0 10px 10px 0;
      overflow: hidden;
      border: 1px solid #c0ccda;
      border-radius: 6px;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
      .el-icon-delete {
        position: absolute;
        top: 0;
        left: 0;
        display: none;
        background: rgba(0, 0, 0, 0.5);
        width: 46px;
        height: 46px;
        line-height: 46px;
        text-align: center;
        font-size: 22px;
        color: #fff;
      }
      &:hover {
        .el-icon-delete {
          display: block;
        }
      }
    }
  }
}
.label-layer {
  .form {
    height: 46px;
    line-height: 26px;
    padding: 10px 0;
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
      margin: 0 0 0 6px;
      font-size: 0;
    }
    /deep/ {
      .el-form-item__content {
        line-height: 26px;
      }
    }
    .el-select {
      width: 180px;
    }
    .el-input {
      width: 180px;
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
  .el-pagination {
    padding: 10px;
  }
}
</style>