<template>
  <el-dialog title="关联用户" class="body0" :visible.sync="isUserDialog">
    <el-table ref="userTable" :data="listTableData.rows" v-loading.body="listTableLoading" height="calc(100vh - 500px)" highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="55" />
      <el-table-column align="center" label="姓名" prop="name" />
      <el-table-column align="center" label="账户" prop="username" />
      <el-table-column fixed="right" align="center" label="性别" width="100px" prop="sex" />
    </el-table>
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-size="listQuery.limit" :page-sizes="[20,30,50]" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total" />
    <div slot="footer">
      <el-button size="mini" type="primary" @click="onSubmit">保存</el-button>
      <el-button size="mini" @click="isUserDialog = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  getUserList,
  getPositionUser,
  postPositionUser
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
      listTableLoading: false,
      listQuery: {
        name: null,
        departId: null,
        offset: 1,
        limit: 20
      },
      listTableData: {},

      userQuery: {
        users: null
      },
      loading: false,
      isUserDialog: false
    };
  },
  watch: {
    isOpen(val) {
      this.isUserDialog = val;
    },
    isUserDialog(val) {
      this.$emit("update:isOpen", val);

      if (val) {
        this.initUsers();
      }
    }
  },
  methods: {
    onSubmit() {
      postPositionUser(this.positionId, this.userQuery).then(res => {
        let isSuccess = res.status === 200;
        // 提示处理
        this.$notify({
          title: isSuccess ? "成功" : "失败",
          message: isSuccess ? "保存成功" : res.message,
          type: isSuccess ? "success" : "error",
          duration: 2000
        });

        if (isSuccess) this.isUserDialog = false;
      });
    },
    initUsers() {
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
      this.listTableData = {};
      this.listTableLoading = true;
      getUserList(this.listQuery).then(res => {
        this.listTableLoading = false;
        this.listTableData = res.data;

        this.$nextTick(() => {
          getPositionUser(this.positionId).then(res => {
            let ids = res.data.map(item => item.id);
            this.listTableData.rows.map(item => {
              if (ids.indexOf(item.id) >= 0) {
                this.$refs.userTable.toggleRowSelection(item);
              }
            });
          });
        });
      });
    },
    onListChange(val) {
      this.userQuery.users = val.map(item => item.id).join(",");
    },
    onListPaging(val) {
      this.listQuery.offset = val;
      this.onFilter();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.onFilter();
    }
  }
};
</script>
<style lang="scss" scoped>
.el-pagination {
  padding: 10px;
}
.multiple-select {
  width: 100%;
}
* /deep/ .select-right {
  float: right;
  margin-right: 30px;
  color: #8492a6;
  font-size: 13px;
}
</style>
