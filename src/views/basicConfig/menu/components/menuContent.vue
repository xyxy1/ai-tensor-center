<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-form :inline="true" class="form" :model="listQuery">
        <el-form-item label="关键字" prop="keyword">
          <el-input @keyup.enter.native="onSearch" style="width: 200px;" size="mini" placeholder="资源名称" v-model="listQuery.keyword" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" icon="search" @click="onSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        菜单管理
        <em>{{listData.total?listData.total:0}}</em>
      </div>
      <div class="right">
        <el-button class="txt-btn" size="mini" @click="onItemAdd" type="text" icon="el-icon-plus">添加</el-button>
        <el-button class="txt-btn" size="mini" icon="el-icon-delete" type="text" @click="onItemDelete()" style="margin-left: 0px">删除</el-button>
      </div>
    </div>
    <el-table :data="listData.rows" v-loading.body="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100vh - 302px)" @selection-change="onListChange">
      <el-table-column align="center" type="selection" width="45" />
      <el-table-column align="center" label="资源编码" prop="code" />
      <el-table-column align="center" label="资源类型" prop="type" />
      <el-table-column align="center" label="资源名称" prop="name" />
      <el-table-column align="center" label="资源地址" prop="uri" />
      <el-table-column align="center" label="资源请求类型" prop="method" min-width="105"/>
      <el-table-column align="center" fixed="right" label="操作" width="80">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="onItemEdit(scope.row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination @size-change="onSizeChange" @current-change="onCurrentChange" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total" />
    <!-- 资源弹窗 -->
    <el-dialog :title="form.id?'编辑资源':'新增资源'" :visible.sync="dialogFormVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="110px">
        <el-form-item label="资源编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入资源编码" />
        </el-form-item>
        <el-form-item label="资源类型" prop="type">
          <dict-select dict-name="authority_element" v-model="form.type" placeholder="请输入资源类型" />
        </el-form-item>
        <el-form-item label="资源名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入资源名称" />
        </el-form-item>
        <el-form-item label="资源地址" prop="uri">
          <el-input v-model="form.uri" placeholder="请输入资源地址" />
        </el-form-item>
        <el-form-item label="资源请求类型" prop="method">
          <el-select class="filter-item" v-model="form.method" placeholder="请输入资源请求类型">
            <el-option v-for="item in methodOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible=false">取 消</el-button>
        <el-button type="primary" @click="onSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>


<script>
import {
  getMenuContentList,
  postMenuContent,
  getMenuContent,
  deleteMenuContent,
  putMenuContent
} from "@/api/basicConfig/menuContent/index";
export default {
  data() {
    return {
      menuId: -1,
      form: {
        code: undefined,
        type: undefined,
        name: undefined,
        uri: undefined,
        menuId: undefined,
        method: undefined,
        description: undefined
      },
      listIds: [],
      rules: {
        code: [{ required: true, message: "请输入资源编码" }],
        type: [
          { required: true, message: "请输入资源类型" },
          { min: 2, max: 20, message: "长度在 2 到 20 个字符" }
        ],
        name: [
          { required: true, message: "请输入资源名称" },
          { min: 2, max: 20, message: "长度在 2 到 20 个字符" }
        ],
        uri: [
          { required: true, message: "请输入" },
          { min: 3, max: 40, message: "长度在 3 到 40 个字符" }
        ],
        method: [
          { required: true, message: "请输入资源请求类型" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
        ],
        description: [
          { required: true, message: "请输入" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符" }
        ]
      },
      listData: {},
      listLoading: true,
      listQuery: {
        offset: 1,
        limit: 15,
        name: undefined,
        menuId: this.menuId
      },
      dialogFormVisible: false,
      methodOptions: ["GET", "POST", "PUT", "DELETE"]
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      this.listQuery.menuId = this.menuId;
      getMenuContentList(this.listQuery).then(response => {
        this.listData = response.data;
        this.listLoading = false;
      });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.getList();
    },
    onSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    onCurrentChange(val) {
      this.listQuery.offset = val;
      this.getList();
    },
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    onItemAdd() {
      if (this.menuId == "-1") {
        this.$notify({
          title: "失败",
          message: "请先选择菜单",
          type: "warning",
          duration: 2000
        });
      } else {
        this.resetTemp();
        this.dialogFormVisible = true;
      }
    },
    onItemEdit(row) {
      getMenuContent(row.id).then(response => {
        this.form = response.data;
        this.dialogFormVisible = true;
      });
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

      this.$confirm("此操作将永久删除，是否继续？", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonClass: "el-button--mini",
        cancelButtonClass: "el-button-mini fr",
        type: "warning"
      }).then(() => {
        deleteMenuContent({
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
            this.getList();
          }
        });
      });
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return false;

        this.form.menuId = this.menuId;
        if (!this.form.id) {
          postMenuContent(this.form).then(res => {
            let isSuccess = res.status == 200;
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "新增成功" : "新增失败",
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.dialogFormVisible = false;
              this.getList();
            }
          });
        } else {
          putMenuContent(this.form.id, this.form).then(res => {
            let isSuccess = res.status == 200;
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "修改成功" : "修改失败",
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.dialogFormVisible = false;
              this.getList();
            }
          });
        }
      });
    },

    resetTemp() {
      this.form = {
        code: undefined,
        type: undefined,
        name: undefined,
        uri: undefined,
        menuId: undefined,
        method: undefined,
        description: undefined
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  border-radius: 0px;
  box-shadow: none;
  .filter-container {
    background-color: #fafbfb;
    margin-top: 0px;
    margin-bottom: 0px;
    .form {
      height: 46px;
      line-height: 46px;
      .el-form-item {
        margin: 0px 3px 0px 0px;
        line-height: 46px;
        font-size: 0;
        .el-button {
          margin-right: 3px;
        }
      }
    }
  }
}
.el-pagination {
  padding: 10px 0 10px 10px;
}
/deep/.el-form--inline .el-form-item__content {
  vertical-align: middle;
}
</style>
