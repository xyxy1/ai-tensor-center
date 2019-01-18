<template>
  <el-dialog title="关联角色" class="position-group body0" :visible.sync="isGroupDialog">
    <!-- 表单筛选 -->
    <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="getTableList">
      <el-form-item label="关键字">
        <el-input size="mini" placeholder="输入关键字进行过滤" v-model="listQuery.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="getTableList">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table height="calc(100vh - 500px)" ref="listTable" :data="listTableData.rows" v-loading.body="listLoading" border highlight-current-row style="width: 100%" @select="onSelectionChange" @select-all="onSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column align="center" label="角色名称" prop="groupName" />
      <el-table-column align="center" label="备注" prop="description" />
      <el-table-column fixed="right" align="center" label="类型" prop="groupType" width="100" />
    </el-table>

    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-size="listQuery.limit" :page-sizes="[20,30,50]" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total" />
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="onSubmit">保存</el-button>
      <el-button size="mini" @click="isGroupDialog = false">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  getRoleList,
  postPositionRole,
  getPositionRole
} from "@/api/userManage";
export default {
  props: {
    departId: {
      type: [String, Number],
      default: null
    },
    positionId: {
      type: [String, Number],
      default: null
    },
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      listLoading: false,
      listQuery: {
        name: null,
        departId: null,
        offset: 1,
        limit: 20
      },
      listTableData: {},
      choiceIdArr: [],
      isGroupDialog: false
    };
  },
  watch: {
    isOpen(val) {
      this.isGroupDialog = val;
      this.choiceIdArr = [];
    },
    isGroupDialog(val) {
      this.$emit("update:isOpen", val);

      if (val) {
        this.getTableList();
      }
    }
  },
  methods: {
    getTableList() {
      if (!this.departId) {
        this.$notify({
          title: "提示",
          message: "请先选择部门节点！",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.listQuery.departId = this.departId;
      this.listLoading = true;
      getRoleList(this.listQuery).then(listRes => {
        this.listLoading = false;
        this.listTableData = listRes.data;

        this.$nextTick(() => {
          getPositionRole(this.positionId).then(res => {
            let ids = res.data.map(item => item.id);

            this.listTableData.rows.map(item => {
              if (ids.indexOf(item.id) >= 0) {
                this.$refs.listTable.toggleRowSelection(item);
              }
            });
          });
        });
      });
    },
    onSubmit() {
      postPositionRole(this.positionId, {
        groups: this.choiceIdArr.join(",")
      }).then(res => {
        let isSuccess = res.status === 200;
        // 提示处理
        this.$notify({
          title: isSuccess ? "成功" : "失败",
          message: isSuccess ? "关联角色成功" : res.message,
          type: isSuccess ? "success" : "error",
          duration: 2000
        });

        if (isSuccess) this.isGroupDialog = false;
      });
    },
    onSelectionChange(val) {
      this.choiceIdArr = val.map(item => item.id);
    },
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getTableList();
    }
  }
};
</script>
<style lang="scss" scoped>
.position-group {
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
  .el-pagination {
    padding: 10px;
  }
}
</style>
