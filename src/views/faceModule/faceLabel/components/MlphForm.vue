<template>
  <el-dialog title="门禁权限" class="accesses-layer body0" :visible.sync="isMlphDialog" width="800px">
    <el-form size="mini" class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="getTableList">
      <el-form-item>
        <el-input placeholder="门楼牌号" v-model="listQuery.mlph"></el-input>
        <el-input placeholder="楼牌号" v-model="listQuery.lph"></el-input>
        <el-input placeholder="单元号" v-model="listQuery.dyh"></el-input>
        <el-input placeholder="房间号" v-model="listQuery.fjh"></el-input>
        <el-select v-model="listQuery.type" placeholder="类型">
          <el-option label="小区" value="1"></el-option>
          <el-option label="楼号" value="2"></el-option>
          <el-option label="单元" value="3"></el-option>
          <el-option label="房间" value="4"></el-option>
        </el-select>
        <el-button type="primary" @click="getTableList">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="listData.rows" class="table" height="400px" @cell-dblclick="onSubmit" @current-change="onTableChange">
      <el-table-column align="center" prop="mlphName" label="名称" />
      <el-table-column align="center" prop="type" label="类型" />
    </el-table>
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[25,100,250]" :page-size="listQuery.limit" :total="listData.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="onSubmit()">确定</el-button>
      <el-button size="mini" @click="isMlphDialog = false">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getMlphList } from "@/api/faceModule/faceLabel/index";

export default {
  props: {
    data: Object,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data: () => ({
    isMlphDialog: false,
    listData: {},
    listQuery: {
      offset: 1,
      limit: 25,
      mlph: undefined,
      lph: undefined,
      dyh: undefined,
      fjh: undefined,
      type: undefined
    },
    currentRow: null
  }),
  watch: {
    isOpen(val) {
      this.isMlphDialog = val;
    },
    isMlphDialog(val) {
      this.$emit("update:isOpen", val);

      val && this.getTableList();
    }
  },
  methods: {
    getTableList() {
      getMlphList(this.listQuery).then(res => {
        if (res.status == 200) {
          this.listData = res.data;
        }
      });
    },
    onSubmit() {
      if (this.currentRow === null) {
        this.$notify({
          title: "提示",
          message: "请先选择门派楼号",
          type: "warning",
          duration: 2000
        });
        return;
      }
      this.$emit("update:data", this.currentRow);
      this.isMlphDialog = false;
    },
    onTableChange(row) {
      this.currentRow = {
        id: row.mlphId,
        content: row.mlphName
      };
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
  .el-select,
  .el-input {
    width: 120px;
  }
}
</style>
