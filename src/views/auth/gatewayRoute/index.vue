<template>
  <div>
    <div class="filter-container">
      <label class="input-label">关键字</label>
      <div class="picture-btn-wrap">
        <picture-search ref="pictureSearch" size="mini" style="width: 200px;" placeholder="映射服务" @change="onSearchChange"></picture-search>
      </div>
      <el-button size="mini" type="primary" icon="search" @click="handleFilter">搜索</el-button>
      <el-button size="mini" @click="onResetForm">重置</el-button>
      <el-button size="mini" @click="handleCreate" type="primary" icon="edit">添加</el-button>
    </div>
    <!-- 工具栏 -->
    <div class="common-tool">
      <div class="title">
        网关路由管理
        <em>{{total?total:0}}</em>
      </div>
      <div class="re-right">
        <el-button class="txt-btn" size="mini" icon="el-icon-delete" type="text" @click="onItemDelete">删除</el-button>
      </div>
    </div>
    <el-table :key='tableKey' :data="list" height="calc(100vh - 325px)" v-loading.body="listLoading" border fit highlight-current-row @selection-change="onListChange">
      <el-table-column type="selection" width="50" />
      <el-table-column align="center" label="id" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="映射路劲">
        <template slot-scope="scope">
          <span>{{scope.row.path}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="映射服务">
        <template slot-scope="scope">
          <span>{{scope.row.serviceId}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="映射外连接">
        <template slot-scope="scope">
          <span>{{scope.row.url}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="允许重试">
        <template slot-scope="scope">
          <el-tag :type="scope.row.retryable ? 'primary' : 'warning'" close-transition>
            <span v-if="scope.row.retryable">是</span>
            <span v-else>否</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="启用">
        <template slot-scope="scope">
          <el-tag :type="scope.row.enabled ? 'primary' : 'warning'" close-transition>
            <span v-if="scope.row.enabled">是</span>
            <span v-else>否</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="忽略前缀">
        <template slot-scope="scope">
          <el-tag :type="scope.row.stripPrefix ? 'primary' : 'warning'" close-transition>
            <span v-if="scope.row.stripPrefix">是</span>
            <span v-else>否</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="描述">
        <template slot-scope="scope">
          <span>{{scope.row.description}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="创建人">
        <template slot-scope="scope">
          <span>{{scope.row.crtName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="创建人ID">
        <template slot-scope="scope">
          <span>{{scope.row.crtUser}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{scope.row.crtTime}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="最后更新人">
        <template slot-scope="scope">
          <span>{{scope.row.updName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="最后更新人ID">
        <template slot-scope="scope">
          <span>{{scope.row.updUser}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="最后更新时间">
        <template slot-scope="scope">
          <span>{{scope.row.updTime}}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" label="操作" width="150">
        <template slot-scope="scope">
          <a href="javascript:;" class="table-editor" @click="handleUpdate(scope.row)">编辑</a>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel('form')">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="create('form')">确 定</el-button>
        <el-button v-else type="primary" @click="update('form')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  page,
  addObj,
  getObj,
  delObj,
  batchDelObj,
  putObj
} from "@/api/auth/gatewayRoute/index";
import { mapGetters } from "vuex";
export default {
  name: "base-gatewayManager",
  data() {
    return {
      form: {
        path: undefined,
        serviceId: undefined,
        url: undefined,
        retryable: false,
        enabled: true,
        stripPrefix: true
      },
      listIds: [],
      rules: {
        path: [
          {
            required: true,
            message: "请输入映射路劲",
            trigger: "blur"
          },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur"
          }
        ],
        serviceId: [
          {
            required: true,
            message: "请输入映射服务",
            trigger: "blur"
          },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur"
          }
        ],
        url: [
          {
            required: true,
            message: "请输入映射外连接",
            trigger: "blur"
          },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur"
          }
        ],
        retryable: [
          {
            required: true,
            message: "请输入是否重试",
            trigger: "blur"
          }
        ],
        enabled: [
          {
            required: true,
            message: "请输入是否启用",
            trigger: "blur"
          }
        ],
        stripPrefix: [
          {
            required: true,
            message: "请输入是否忽略前缀",
            trigger: "blur"
          }
        ]
      },
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: undefined
      },
      dialogFormVisible: false,
      dialogStatus: "",
      gatewayRouteManager_btn_edit: false,
      gatewayRouteManager_btn_del: false,
      gatewayRouteManager_btn_add: false,
      textMap: {
        update: "编辑",
        create: "创建"
      },
      tableKey: 0
    };
  },
  created() {
    this.getList();
    this.gatewayRouteManager_btn_edit = this.elements[
      "gatewayRouteManager:btn_edit"
    ];
    this.gatewayRouteManager_btn_del = this.elements[
      "gatewayRouteManager:btn_del"
    ];
    this.gatewayRouteManager_btn_add = this.elements[
      "gatewayRouteManager:btn_add"
    ];
  },
  computed: {
    ...mapGetters(["elements"])
  },
  methods: {
    getList() {
      this.listLoading = true;
      page(this.listQuery).then(response => {
        this.list = response.data.rows;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },
    handleFilter() {
      this.getList();
    },
    // 关键字搜索框
    onSearchChange(val, img) {
      this.listQuery.keyword = val;
      this.listQuery.image = img;
    },
    // 重置按钮
    onResetForm() {
      this.listQuery = {
        keyword: "",
        image: ""
      };
      this.$refs.pictureSearch.reset();
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
            this.getList();
          }
        });
      });
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
    },
    handleUpdate(row) {
      getObj(row.id).then(response => {
        this.form = response.data;
        this.dialogFormVisible = true;
        this.dialogStatus = "update";
      });
    },
    handleDelete(row) {
      this.$confirm("此操作将导致路由无法映射, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        delObj(row.id).then(() => {
          this.$notify({
            title: "成功",
            message: "禁用成功",
            type: "success",
            duration: 2000
          });
          // const index = this.list.indexOf(row);
          // this.list.splice(index, 1);
          this.getList();
        });
      });
    },
    create(formName) {
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          addObj(this.form).then(() => {
            this.dialogFormVisible = false;
            this.getList();
            this.$notify({
              title: "成功",
              message: "创建成功",
              type: "success",
              duration: 2000
            });
          });
        } else {
          return false;
        }
      });
    },
    cancel(formName) {
      this.dialogFormVisible = false;
      const set = this.$refs;
      set[formName].resetFields();
    },
    update(formName) {
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false;
          this.form.password = undefined;
          putObj(this.form.id, this.form).then(() => {
            this.dialogFormVisible = false;
            this.getList();
            this.$notify({
              title: "成功",
              message: "编辑成功",
              type: "success",
              duration: 2000
            });
          });
        } else {
          return false;
        }
      });
    },
    resetTemp() {
      this.form = {
        path: undefined,
        serviceId: undefined,
        url: undefined,
        retryable: false,
        enabled: true,
        stripPrefix: true,
        description: undefined
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.el-button {
  margin: 3px;
}
</style>
