<template>
  <el-dialog title="门禁权限" class="accesses-layer body0" :visible.sync="isApsDialog" width="800px">
    <el-form size="mini" class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="getTableList">
      <el-form-item>
        <el-input @keyup.enter.native="getTableList" placeholder="采集系统名称" v-model="listQuery.keyword"></el-input>
        <el-button type="primary" @click="getTableList">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="listData.rows" class="table" height="60vh" @cell-dblclick="onSubmit" @current-change="onTableChange">
      <el-table-column label="名称" prop="name" align="center" />
      <el-table-column label="区域编码" prop="areaCode" align="center" />
      <el-table-column label="警务区编码" prop="policeAreaCode" align="center" />
      <el-table-column label="类型" prop="apsType" align="center" />
    </el-table>
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" :total="listData.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="onSubmit">确定</el-button>
      <el-button size="mini" @click="isApsDialog = false">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getApplicationList } from "@/api/bigData/applicationManage/index";

export default {
  props: {
    data: Object,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data: () => ({
    isApsDialog: false,
    listData: {},
    listQuery: {
      offset: 1,
      limit: 15,
      keyword: null
    },
    currentRow: null
  }),
  watch: {
    isOpen(val) {
      this.isApsDialog = val;
    },
    isApsDialog(val) {
      this.$emit("update:isOpen", val);

      val && this.getTableList();
    }
  },
  methods: {
    getTableList() {
      getApplicationList(this.listQuery).then(res => {
        if (res.status == 200) {
          this.listData = res.data;
        }
      });
    },
    onSubmit() {
      if (this.currentRow === null) {
        this.$notify({
          title: "提示",
          message: "请先选择设备",
          type: "warning",
          duration: 2000
        });
        return;
      }
      this.$emit("complete", this.currentRow);
      this.isApsDialog = false;
    },
    onTableChange(row) {
      this.currentRow = row;
    },
    onListPaging(val) {
      this.listQuery.offset = val;
      this.onSubmit();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.onSubmit();
    }
  }
};
</script>
<style lang="scss" scoped>
.el-pagination {
  padding: 10px;
}
.el-form {
  padding: 10px;
  /deep/ .el-form-item {
    margin: 0;
  }
  .el-input {
    width: 180px;
  }
}
</style>
