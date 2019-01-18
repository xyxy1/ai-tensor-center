<template>
  <div class="position-configure">
    <!-- 表单筛选 -->
    <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="getTableList">
      <el-form-item label="关键字">
        <el-input v-model="listQuery.keyword" size="mini" placeholder="职位/编码" />
      </el-form-item>
      <el-form-item>
        <el-button size="mini" type="primary" @click="getTableList">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" v-permission="'positionMan:modifyPositionUsers'" @click="openDialog('isUserDialog')" type="success" icon="edit">关联用户</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" v-permission="'positionMan:modifyPositionGroups'" @click="openDialog('isGroupDialog')" type="success" icon="edit">关联角色</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" v-permission="'positionMan:modifyPositionDeparts'" @click="openDialog('isDepartDialog')" type="success" icon="edit">数据授权</el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" v-permission="'positionMan:modifyPositionCameras'" @click="openDialog('isCameraDialog')" type="success" icon="edit">摄像头授权</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        岗位管理
        <em>{{listTableData.total?listTableData.total:0}}</em>
      </div>
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemUpdate('')" v-permission="'positionMan:btn_add'">添加</el-button>
        <el-button class="txt-btn" size="mini" icon="el-icon-delete" type="text" @click="onDelete" v-permission="'positionMan:btn_batchDelete'">删除</el-button>
      </div>
    </div>
    <el-table :data="listTableData.rows" v-loading.body="listTableLoading" height="calc(100vh - 302px)" highlight-current-row @row-click="onRowClick" @selection-change="onListChange">
      <el-table-column type="selection" width="50" />
      <el-table-column align="center" label="职位" prop="name" />
      <el-table-column align="center" label="编码" prop="code" />
      <el-table-column fixed="right" align="center" label="操作" width="160px">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemUpdate(scope.row)" v-permission="'positionMan:btn_edit'">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listTableData.total" />

    <el-dialog :title="form.id === null?'新增岗位':'编辑岗位'" :visible.sync="isFormDialog" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="职位" prop="name">
          <el-input v-model="form.name" placeholder="请输入职位"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入编码"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="onSubmit">确 定</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 关联用户 -->
    <position-user :positionId="positionId" :departId="departId" v-permission="'positionMan:btn_assocated_user'" :is-open.sync="isUserDialog" />
    <!-- 关联角色 -->
    <position-role :positionId="positionId" :departId="departId" v-permission="'positionMan:btn_assocated_group'" :is-open.sync="isGroupDialog" />
    <!-- 数据授权 -->
    <position-depart :positionId="positionId" v-permission="'positionMan:btn_assocated_depart'" :is-open.sync="isDepartDialog" />
    <!-- 数据授权 -->
    <position-camera :positionId="positionId" :is-open.sync="isCameraDialog" />
  </div>
</template>

<script>
import {
  getPositionList,
  postPosition,
  deletePosition,
  putPosition,
  getPosition
} from "@/api/userManage";

export default {
  components: {
    "position-user": () => import("./PositionUser"),
    "position-role": () => import("./PositionRole"),
    "position-depart": () => import("./PositionDepart"),
    "position-camera": () => import("./PositionCamera")
  },
  props: {
    departId: {
      type: [String, Number]
    }
  },
  data() {
    return {
      form: {
        id: null,
        name: null,
        code: null,
        departId: null
      },
      rules: {
        name: { required: true, message: "请输入职位" },
        code: [
          { required: true, message: "请输入编码" },
          {
            required: true,
            pattern: /^[a-zA-Z0-9_]+$/,
            message: "只能是字母数字和下划线"
          }
        ]
      },

      listIds: [],
      listTableData: {},
      listTableLoading: true,
      listQuery: {
        offset: 1,
        limit: 15,
        keyword: null,
        departId: null
      },

      positionId: null,
      isFormDialog: false,
      isUserDialog: false,
      isGroupDialog: false,
      isDepartDialog: false,
      isCameraDialog: false,
      dialogStatus: ""
    };
  },
  watch: {
    departId(val) {
      val && this.getTableList();
    }
  },
  methods: {
    getTableList() {
      this.positionId = null;
      this.listTableLoading = true;
      this.listQuery.departId = this.departId;

      getPositionList(this.listQuery)
        .then(res => {
          if (res.status == 200) {
            this.listTableData = res.data;
          }
        })
        .finally(() => {
          this.listTableLoading = false;
        });
    },
    // 重置按钮
    onResetForm() {
      this.listQuery = {
        offset: 1,
        limit: 15,
        keyword: null,
        departId: null
      };
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    // 批量删除
    onDelete() {
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
        deletePosition({
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
            this.getTableList();
          }
        });
      });
    },
    onRowClick(row) {
      if (row) {
        this.positionId = row.id;
      }
    },
    onItemUpdate(row) {
      if (!this.departId) {
        this.$notify({
          title: "提示",
          message: "请先选择部门节点！",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.isFormDialog = true;
      this.$nextTick(() => {
        this.$refs.form.resetFields();
        this.form.password = null;
        if (row) {
          getPosition(row.id).then(res => {
            if (res.status == 200) {
              this.form = res.data;
            }
          });
        } else {
          this.form.id = null;
        }
      });
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return;

        if (this.form.id) {
          putPosition(this.form).then(res => {
            let isSuccess = res.status === 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "修改成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.getTableList();
              this.isFormDialog = false;
            }
          });
        } else {
          this.form.departId = this.departId;
          postPosition(this.form).then(res => {
            let isSuccess = res.status === 200;
            // 提示处理
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "添加成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.getTableList();
              this.isFormDialog = false;
            }
          });
        }
      });
    },
    openDialog(type) {
      if (!this.positionId) {
        this.$notify({
          title: "提示",
          message: "请先相关选择岗位！",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this[type] = true;
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
.position-configure {
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
