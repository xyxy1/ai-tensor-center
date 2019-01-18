<template>
  <div class="label-manage">
    <!-- 表单筛选 -->
    <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="onSearch">
      <span>关键字</span>
      <el-form-item prop="keyword">
        <el-input size="mini" @keyup.enter.native="onSearch" placeholder="姓名/证件号" v-model="listQuery.keyword"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="onSearch">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格模式 S -->
    <el-table ref="listTabel" :data="listData.rows" height="calc(100vh - 260px)" v-loading.body="listLoading" highlight-current-row @selection-change="onListChange">
      <!-- <el-table-column type="selection" width="50" /> -->
      <el-table-column width="80" label="证件照" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.identityImg" class="pic">
        </template>
      </el-table-column>
      <el-table-column width="160" prop="name" label="姓名/证件号">
        <template slot-scope="scope">
          <div class="identity">
            <label>{{scope.row.name}}</label>
            <p>{{scope.row.identityNo}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类别" width="120" align="center">
        <template slot-scope="scope">
          <div class="label-box">
            <span class="label-item" v-for="(item,index) in scope.row.labelNames.split(',')" :key="index" :style="{backgroundColor:item.split('|')[1],color:colorBrightness(item.split('|')[1])}">{{item.split('|')[0]}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="60" prop="sex" label="性别" align="center" />
      <el-table-column width="60" prop="age" label="年龄" align="center" />
      <el-table-column prop="address" label="地址" />
      <el-table-column fixed="right" width="70" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemDetails(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格模式 E -->

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total"></el-pagination>
  </div>
</template>
<script>
import { getLabelList } from "@/api/faceModule/faceLabel/index";

export default {
  props: {
    data: Object
  },
  data: () => ({
    listQuery: {
      offset: 1,
      limit: 15,
      keyword: null,
      communityCode: null,
      mlphId: null
    },
    listIds: [],
    listData: {},
    listLoading: false
  }),
  watch: {
    data(val) {
      if (val) {
        this.listQuery.communityCode = val.communityCode;
        this.listQuery.mlphId = val.id;
        this.getTableList();
      }
    }
  },
  methods: {
    // 获取表格数据
    getTableList() {
      this.listLoading = true;

      getLabelList(this.listQuery)
        .then(res => {
          if (res.status === 200) {
            this.listData = res.data;
          }
        })
        .finally(err => {
          this.listLoading = false;
        });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.listQuery.limit = 15;
      this.getTableList();
    },
    // 人员详情
    onItemDetails(row) {
      // 调用全库搜
      this.$store.dispatch("allSearch/setData", row);
      this.$router.push("/searchAll");
    },
    // 列表参数重置
    onResetForm() {
      this.$refs.listForm.resetFields();
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
    }
  }
};
</script>
<style lang="scss" scoped>
.label-manage {
  .el-button {
    margin-left: 0;
  }
  .el-pagination {
    padding: 10px;
  }
  .form {
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
    .identity {
      line-height: 140%;
      label {
        font-size: 14px;
      }
      p {
        color: #9da5af;
      }
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
}
</style>