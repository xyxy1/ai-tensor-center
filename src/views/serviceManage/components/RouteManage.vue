<template>
  <div class="route-manage">
    <!-- 工具栏 -->
    <div class="common-tool">
      <!-- 表单筛选 -->
      <el-form class="form" @keyup.enter.native="getTableList">
        <span>关键字</span>
        <el-input size="mini" @keyup.enter.native="getTableList" placeholder="映射服务" v-model="listQuery.keyword"></el-input>
        <el-button size="mini" type="primary" icon="search" @click="getTableList">搜索</el-button>
        <el-button size="mini" @click="onResetForm">重置</el-button>
      </el-form>
      <div class="right">
        <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
        <el-button class="txt-btn" size="mini" icon="el-icon-delete" type="text" @click="onItemDelete">删除</el-button>
      </div>
    </div>
    <el-table class="table" :data="listData.rows" height="calc(100vh - 256px)" v-loading="listLoading" border fit highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="path" label="映射路劲" min-width="120" align="center" />
      <el-table-column prop="serviceId" label="映射服务" min-width="120" align="center" />
      <el-table-column prop="url" label="映射外连接" min-width="200" align="center" />
      <el-table-column label="允许重试" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.retryable ? 'primary' : 'warning'" close-transition>
            <span>{{scope.row.retryable ? '是' : '否'}}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="启用" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.enabled ? 'primary' : 'warning'" close-transition>
            <span>{{scope.row.enabled ? '是' : '否'}}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="忽略前缀" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.stripPrefix ? 'primary' : 'warning'" close-transition>
            <span>{{scope.row.stripPrefix ? '是' : '否'}}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center" />
      <el-table-column label="创建人/创建时间" width="180">
        <template slot-scope="scope">
          <div class="group">
            <label>{{scope.row.crtName}}</label>
            <p>{{scope.row.crtTime && moment(scope.row.crtTime, "YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss")}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="更新人/更新时间" width="180">
        <template slot-scope="scope">
          <div class="group">
            <label>{{scope.row.updName}}</label>
            <p>{{scope.row.updTime && moment(scope.row.updTime, "YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss")}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" label="操作" width="80">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemEdit(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" :total="listData.total" layout="total, sizes, prev, pager, next, jumper" />

    <el-dialog :title="form.id?'编辑':'添加'" :visible.sync="isFormDialog">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="映射路劲" prop="path">
          <el-input v-model="form.path" placeholder="请输入映射路劲"></el-input>
        </el-form-item>
        <el-form-item label="映射服务" prop="serviceId">
          <el-input v-model="form.serviceId" placeholder="请输入映射服务"></el-input>
        </el-form-item>
        <el-form-item label="映射外连接">
          <el-input v-model="form.url" placeholder="请输入映射外连接"></el-input>
        </el-form-item>
        <el-form-item label="允许重试" prop="retryable">
          <el-switch v-model="form.retryable" active-text="是" inactive-text="否">
          </el-switch>
        </el-form-item>
        <el-form-item label="启用" prop="enabled">
          <el-switch v-model="form.enabled" active-text="是" inactive-text="否">
          </el-switch>
        </el-form-item>
        <el-form-item label="忽略前缀" prop="stripPrefix">
          <el-switch v-model="form.stripPrefix" active-text="是" inactive-text="否">
          </el-switch>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入服务描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">保 存</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
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
  putObj
} from "@/api/auth/gatewayRoute/index";
export default {
  data() {
    return {
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
        path: null,
        serviceId: null,
        url: null,
        retryable: false,
        enabled: true,
        stripPrefix: true
      },
      rules: {
        path: [
          { required: true, message: "请输入映射路劲" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
        ],
        serviceId: [
          { required: true, message: "请输入映射服务" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
        ],
        url: [
          { required: true, message: "请输入映射外连接" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
        ],
        retryable: { required: true, message: "请输入是否重试" },
        enabled: { required: true, message: "请输入是否启用" },
        stripPrefix: { required: true, message: "请输入是否忽略前缀" }
      },
      isFormDialog: false
    };
  },
  methods: {
    init() {
      this.getTableList();
    },
    getTableList() {
      this.listLoading = true;
      page(this.listQuery)
        .then(res => {
          this.listData = res.data;
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    // 关键字搜索框
    onSearchChange(val, img) {
      this.listQuery.keyword = val;
      this.listQuery.image = img;
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
    }
  }
};
</script>
<style lang="scss" scoped>
.route-manage {
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