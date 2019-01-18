<template>
  <div class="jurisdiction-manage">
    <!-- 工具栏 -->
    <div class="common-tool">
      <!-- 表单筛选 -->
      <el-form class="form" @keyup.enter.native="getTableList">
        <span>关键字</span>
        <el-input size="mini" @keyup.enter.native="getTableList" placeholder="服务编码/服务名" v-model="listQuery.keyword"></el-input>
        <el-button size="mini" type="primary" icon="search" @click="getTableList">搜索</el-button>
        <el-button size="mini" @click="onResetForm">重置</el-button>
        <el-button size="mini" type="primary" @click="onClient">授权服务</el-button>
        <el-button size="mini" type="primary" @click="onGenerator">构建工程</el-button>
      </el-form>
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-delete" @click="onItemDelete">删除</el-button>
      </div>
    </div>

    <el-table class="table" :data="listData.rows" height="calc(100vh - 256px)" v-loading="listLoading" @current-change="onCurrentChange" highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="50" />
      <!-- <el-table-column prop="id" label="id" width="65" align="center" /> -->
      <el-table-column prop="code" label="服务编码" min-width="120" align="center" />
      <el-table-column prop="secret" label="服务密钥" min-width="120" align="center" />
      <el-table-column prop="name" label="服务名" min-width="120" align="center" />
      <el-table-column prop="description" label="描述" min-width="120" align="center" />
      <el-table-column label="创建人/创建时间" width="180">
        <template slot-scope="scope">
          <div class="group">
            <label>{{scope.row.crtName}}</label>
            <p>{{scope.row.crtTime && moment(scope.row.crtTime, "YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss")}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="crtHost" label="创建主机" min-width="120" align="center" />
      <el-table-column label="更新人/更新时间" width="180">
        <template slot-scope="scope">
          <div class="group">
            <label>{{scope.row.updName}}</label>
            <p>{{scope.row.updTime && moment(scope.row.updTime, "YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss")}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="updHost" label="更新主机" min-width="120" align="center" />
      <el-table-column fixed="right" align="center" label="操作" width="80">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemEdit(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" :total="listData.total" layout="total, sizes, prev, pager, next, jumper" />

    <el-dialog :title="form.id?'编辑':'添加'" :visible.sync="isFormDialog">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="服务编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入服务编码"></el-input>
        </el-form-item>
        <el-form-item label="服务密钥" prop="secret">
          <el-input v-model="form.secret" placeholder="请输入服务密钥"></el-input>
        </el-form-item>
        <el-form-item label="服务名" prop="name">
          <el-input v-model="form.name" placeholder="请输入服务名"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">保 存</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 授权服务 -->
    <authorization-form :serviceId="currentId" :is-open.sync="isAuthorizationVisible" ref="serviceClient" />

    <!-- 构建工程 -->
    <el-dialog title="初始化工程" :visible.sync="isProjectFormVisible" width="500px">
      <el-form :model="buildProjectForm" :rules="buildProjectRules" ref="buildProjectForm" label-width="100px">
        <el-form-item label="package" prop="package">
          <el-input v-model="buildProjectForm.package" placeholder="请输入工程包路径"></el-input>
        </el-form-item>
        <el-form-item label="分布式事务">
          <el-switch on-text="true" off-text="false" v-model="buildProjectForm.tx"></el-switch>
        </el-form-item>
        <el-form-item label="链路追踪">
          <el-switch on-text="true" off-text="false" v-model="buildProjectForm.zipkin"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="buildProject">保 存</el-button>
        <el-button size="mini" @click="isProjectFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";
import {
  page,
  addObj,
  getObj,
  batchDelObj,
  putObj,
  buildProject
} from "@/api/auth/service/index";
import { getToken } from "@/utils/auth";

export default {
  components: {
    AuthorizationForm: () => import("./AuthorizationForm")
  },
  data() {
    return {
      isFormDialog: false,
      isAuthorizationVisible: false,
      isProjectFormVisible: false,

      moment: moment,
      listIds: [],
      listData: {},
      listLoading: true,
      listQuery: {
        offset: 1,
        limit: 15,
        keyword: null
      },

      form: {
        id: null,
        code: null,
        secret: null,
        name: null,
        description: null
      },
      rules: {
        code: [
          { required: true, message: "请输入服务编码" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
        ],
        secret: [
          { required: true, message: "请输入服务密钥" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
        ],
        name: [
          { required: true, message: "请输入服务名" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
        ]
      },

      buildProjectForm: {
        package: null,
        zipkin: "false",
        tx: "false"
      },
      buildProjectRules: {
        package: [
          { required: true, message: "请输入合法的包路径" },
          { min: 3, message: "长度在 3个字符以上" }
        ]
      },

      currentId: null,
      currentName: null
    };
  },
  methods: {
    init() {
      this.getTableList();
    },
    getTableList() {
      this.currentId = null;
      this.currentName = null;

      this.listLoading = true;
      page(this.listQuery)
        .then(res => {
          this.listData = res.data;
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    // 重置按钮
    onResetForm() {
      this.listQuery = {
        offset: 1,
        limit: 15,
        keyword: null
      };
    },
    // 编辑表单
    onItemEdit(id) {
      this.form.id = id || null;

      if (this.form.id) {
        getObj(this.form.id).then(res => {
          if (res.status === 200) {
            this.isFormDialog = true;
            this.$nextTick(() => {
              this.$refs.form && this.$refs.form.resetFields();
              this.form = res.data;
            });
          }
        });
      } else {
        this.isFormDialog = true;
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.resetFields();
        });
      }
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
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
        batchDelObj({
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
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.id) {
            putObj(this.form.id, this.form).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "保存成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.isFormDialog = false;
                this.getTableList();
              }
            });
          } else {
            // 新增
            addObj(this.form).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "新增成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.isFormDialog = false;
                this.getTableList();
              }
            });
          }
        }
      });
    },
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    },
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getTableList();
    },

    onCurrentChange(val) {
      this.currentId = val.id;
      this.currentName = val.code;
    },
    onClient() {
      if (!this.currentId && !this.currentName) {
        this.$notify({
          title: "提示",
          message: "请选择一个服务",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.isAuthorizationVisible = true;
    },
    onGenerator() {
      if (!this.currentId && !this.currentName) {
        this.$notify({
          title: "提示",
          message: "请选择一个服务",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.isProjectFormVisible = true;
    },
    buildProject() {
      this.$refs.buildProjectForm.validate(valid => {
        if (valid) {
          buildProject(this.currentId, this.buildProjectForm.package).then(
            () => {
              const fileName = this.currentName + ".zip";
              const elink = document.createElement("a");
              elink.download = fileName;
              elink.style.display = "none";
              elink.href =
                "/api/auth/generator/build?id=" +
                this.currentId +
                "&packageName=" +
                this.buildProjectForm.package +
                "&token=" +
                getToken() +
                "&zipkin=" +
                this.buildProjectForm.zipkin +
                "&tx=" +
                this.buildProjectForm.tx;
              document.body.appendChild(elink);
              elink.click();
              URL.revokeObjectURL(elink.href); // 释放URL 对象
              document.body.removeChild(elink);
              this.isProjectFormVisible = false;
            }
          );
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.jurisdiction-manage {
  .common-tool {
    border-top: 0;
  }
  .table {
    .group {
      label {
        display: inline-block;
        vertical-align: top;
        line-height: 120%;
      }
      p {
        line-height: 120%;
      }
    }
    .el-button {
      margin: 0;
    }
  }
  .el-pagination {
    padding: 10px;
  }
}
</style>
