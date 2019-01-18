<template>
  <div class="main">
    <el-row class="rowMain">
      <el-col :span="5" class="aside">
        <div class="titleBox">
          <el-input placeholder="输入关键字进行过滤" clearable prefix-icon="el-icon-search" size="mini" v-model="filterText">
            <el-button size="mini" slot="append" @click="onAddTypeItem(4)">
              <i class="el-icon-plus" />
            </el-button>
          </el-input>
        </div>
        <div class="treeBox">
          <el-tree class="filter-tree" node-key="id" :data="dictTypeData" :props="defaultProps" default-expand-all :expand-on-click-node="false" :filter-node-method="filterNode" ref="dictTypeTree" @node-click="getNodeData" highlight-current>
            <div slot-scope="{ node, data }" class="dict-item">
              {{ node.label }}
              <el-dropdown class="more" @command="onCommand($event, data)">
                <div class="icon">
                  <svg-icon icon-class="more" />
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="add">添加</el-dropdown-item>
                  <el-dropdown-item command="upd">编辑</el-dropdown-item>
                  <el-dropdown-item command="del">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-tree>
        </div>
      </el-col>
      <el-col :span="19" style="height:100%">
        <div class="grid-content bg-purple-light">
          <div class="filter-container">
            <el-form :model="listDictValueQuery" ref="listForm" :inline="true" class="form">
              <el-form-item prop="keyword" label="关键字">
                <el-input type="text" size="mini" style="width: 200px;" placeholder="值/编码" v-model="listDictValueQuery.keyword" />
              </el-form-item>
              <el-form-item>
                <el-button size="mini" type="primary" icon="search" @click="onSearch">搜索</el-button>
              </el-form-item>
              <el-form-item>
                <el-button size="mini" @click="onResetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 工具栏 -->
          <div class="common-tool">
            <div class="title">
              数据字典
              <em>{{dictValueTableData.total?dictValueTableData.total:0}}</em>
            </div>
            <div class="right">
              <el-button class="txt-btn" size="mini" @click="onAddValueItem" type="text" icon="el-icon-plus">添加</el-button>
              <el-button class="txt-btn" size="mini" icon="el-icon-delete" type="text" style="margin-left:0px" @click="onItemDelete">删除</el-button>
            </div>
          </div>

          <el-table :data="dictValueTableData.rows" border highlight-current-row height="calc(100vh - 302px)" style="width: 100%" @selection-change="onListChange">
            <el-table-column type="selection" width="45" />
            <el-table-column label="操作" width="80px" fixed="right" align="center">
              <template slot-scope="scope">
                <el-button type="success" size="mini" @click="onValueEdit(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
            <el-table-column width="200px" align="center" label="编码" prop="code" />
            <el-table-column align="center" label="值" prop="value" />
            <el-table-column align="center" label="默认显示" prop="labelDefault" />
            <el-table-column align="center" label="排序" prop="orderNum" />
            <el-table-column align="center" label="英文显示" prop="labelEnUs" />
            <el-table-column align="center" label="中文显示" prop="labelZhCh" />
            <el-table-column width="130px" align="center" label="最后更新人" prop="updName" />
            <el-table-column width="130px" align="center" label="最后更新人ID" prop="updUser" />
            <el-table-column width="150px" align="center" label="最后更新时间" prop="updTime" />
          </el-table>

          <el-pagination @size-change="onSizeChange" @current-change="onCurrentChange" :current-page.sync="listDictValueQuery.offset" :page-sizes="[15,30,50]" :page-size="listDictValueQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="dictValueTableData.total" />
        </div>
      </el-col>
    </el-row>
    <!-- 字典树弹窗 -->
    <el-dialog :visible.sync="isFormDialog" :title="dictTypeForm.id?'编辑字典类型':'新增字典类型'" width="500px">
      <el-form :model="dictTypeForm" status-icon :rules="dictTypeFormRules" ref="dictTypeForm" label-width="80px" class="demo-ruleForm">
        <el-form-item label="编码" prop="code">
          <el-input v-model="dictTypeForm.code" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="目录名" prop="name">
          <el-input v-model="dictTypeForm.name" placeholder="请输入目录名" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSubmitType">保存</el-button>
        <el-button @click="isFormDialog = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 字典值弹窗 -->
    <el-dialog :title="dictValueForm.id?'编辑字典值':'新增字典值'" :visible.sync="dictValueDialogVisible" width="500px">
      <el-form :model="dictValueForm" :rules="dictValueFormRules" ref="dictValueForm" label-width="80px">
        <el-form-item label="编码值" prop="code">
          <el-input v-model="dictValueForm.code" placeholder="请输入值">
            <template slot="prepend">{{currentDictType.code+'_'}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="默认显示" prop="labelDefault">
          <el-input v-model="dictValueForm.labelDefault" placeholder="请输入默认显示" />
        </el-form-item>
        <el-form-item label="英文显示" prop="labelEnUs">
          <el-input v-model="dictValueForm.labelEnUs" placeholder="请输入英文显示" />
        </el-form-item>
        <el-form-item label="中文显示" prop="labelZhCh">
          <el-input v-model="dictValueForm.labelZhCh" placeholder="请输入中文显示" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input v-model="dictValueForm.orderNum" placeholder="请输入排序" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dictValueDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="onSubmitValue('dictValueForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getDictTypeTree,
  postDictType,
  getDictType,
  deleteDictType,
  putDictType
} from "@/api/dict/dictType/index";
import {
  getDictValueList,
  postDictValue,
  deleteDictValue,
  putDictValue
} from "@/api/dict/dictValue/index";

const dictTypeForm = {
  code: null,
  name: null
};

export default {
  name: "base-dictManager",
  data() {
    return {
      listIds: [],
      filterText: "",
      dictValueDialogVisible: false,
      currentDictTypeId: undefined,
      currentDictType: {},
      isFormDialog: false,
      dictTypeForm: dictTypeForm,
      listDictValueQuery: {
        offset: 1,
        limit: 15,
        keyword: undefined,
        typeId: undefined
      },
      dictValueForm: {
        code: undefined,
        labelDefault: undefined,
        labelEnUs: undefined,
        labelZhCh: undefined,
        value: undefined
      },
      dictValueFormRules: {
        code: [
          {
            required: true,
            message: "请输入编码",
            trigger: "blur"
          },
          {
            min: 1,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur"
          }
        ],
        labelDefault: [
          {
            required: true,
            message: "请输入默认显示",
            trigger: "blur"
          },
          {
            min: 1,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur"
          }
        ],
        labelEnUs: [
          {
            required: true,
            message: "请输入英文显示",
            trigger: "blur"
          },
          {
            min: 1,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur"
          }
        ],
        labelZhCh: [
          {
            required: true,
            message: "请输入中文显示",
            trigger: "blur"
          },
          {
            min: 1,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur"
          }
        ],
        orderNum: [
          {
            required: true,
            message: "请输入排序",
            trigger: "blur"
          }
        ]
      },
      dictTypeFormRules: {
        code: [
          {
            required: true,
            message: "请输入编码",
            trigger: "blur"
          },
          {
            min: 1,
            max: 100,
            message: "长度在 1 到 100 个字符",
            trigger: "blur"
          }
        ],
        name: [
          {
            required: true,
            message: "请输入目录名",
            trigger: "blur"
          },
          {
            min: 1,
            max: 50,
            message: "长度在 1 到 50 个字符",
            trigger: "blur"
          }
        ]
      },
      dictTypeData: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      dictValueTableData: {}
    };
  },
  watch: {
    filterText(val) {
      this.$refs.dictTypeTree.filter(val);
    }
  },

  methods: {
    init() {
      this.initTreeData();
    },
    initTreeData() {
      getDictTypeTree().then(data => {
        this.dictTypeData = data;
      });
    },
    getNodeData(data) {
      this.currentDictType = data;
      this.currentDictTypeId = data.id;
      this.listDictValueQuery.typeId = data.id;
      getDictValueList(this.listDictValueQuery).then(response => {
        this.dictValueTableData = response.data;
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    onValueEdit(row) {
      this.dictValueDialogVisible = true;
      const { ...obj } = row;
      this.dictValueForm = obj;
      if (this.dictValueForm.code.indexOf(this.currentDictType.code) > -1) {
        this.dictValueForm.code = this.dictValueForm.code.substring(
          this.currentDictType.code.length + 1,
          this.dictValueForm.code.length
        );
      }
    },
    onSizeChange(val) {
      this.listDictValueQuery.limit = val;
      getDictValueList(this.listDictValueQuery).then(response => {
        this.dictValueTableData = response.data;
      });
    },
    onCurrentChange(val) {
      this.listDictValueQuery.offset = val;
      getDictValueList(this.listDictValueQuery).then(response => {
        this.dictValueTableData = response.data;
      });
    },
    // 重置按钮
    onResetForm() {
      this.$refs.listForm.resetFields();
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
        deleteDictValue({
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
            this.onSearch();
          }
        });
      });
    },
    onSearch() {
      this.listDictValueQuery.offset = 1;
      this.listDictValueQuery.typeId = this.currentDictTypeId;
      getDictValueList(this.listDictValueQuery).then(response => {
        this.dictValueTableData = response.data;
      });
    },
    onSubmitValue(formName) {
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          if (this.dictValueForm.id !== undefined) {
            this.dictValueForm.value = this.dictValueForm.code;
            this.dictValueForm.code =
              this.currentDictType.code + "_" + this.dictValueForm.code;
            putDictValue(this.dictValueForm.id, this.dictValueForm).then(() => {
              this.onSearch();
              this.$notify({
                title: "成功",
                message: "修改成功",
                type: "success",
                duration: 2000
              });
              this.dictValueDialogVisible = false;
            });
          } else {
            this.dictValueForm.value = this.dictValueForm.code;
            this.dictValueForm.code =
              this.currentDictType.code + "_" + this.dictValueForm.code;
            this.dictValueForm.typeId = this.currentDictTypeId;
            postDictValue(this.dictValueForm).then(() => {
              this.onSearch();
              this.$notify({
                title: "成功",
                message: "添加成功",
                type: "success",
                duration: 2000
              });
              this.dictValueDialogVisible = false;
            });
          }
        } else {
          return false;
        }
      });
    },
    onAddValueItem() {
      if (this.currentDictTypeId === undefined) {
        this.$notify({
          title: "失败",
          message: "请先选择字典目录",
          type: "warning",
          duration: 2000
        });
      } else {
        this.dictValueDialogVisible = true;
        this.resetDictValueForm();
      }
    },
    onAddTypeItem(pId) {
      this.openForm(
        Object.assign(dictTypeForm, {
          parentId: pId
        })
      );
    },
    onCommand(command, data) {
      if (command == "add") {
        this.onAddTypeItem(data.id);
      }
      if (command == "upd") {
        getDictType(data.id).then(res => {
          if (res.status == 200) {
            this.openForm(res.data);
          }
        });
        this.isFormDialog = true;
      }
      if (command == "del") {
        this.$confirm(`确定删除【${data.label}】？`, "提示", {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          confirmButtonClass: "el-button--mini",
          cancelButtonClass: "el-button--mini fr",
          type: "warning"
        }).then(() => {
          deleteDictType(data.id).then(res => {
            let isSuccess = res.status == 200;

            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "删除成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.init();
            }
          });
        });
      }
    },
    //字典树表单提交
    onSubmitType() {
      this.$refs.dictTypeForm.validate(valid => {
        if (!valid) return false;
        if (this.dictTypeForm.id) {
          putDictType(this.dictTypeForm.id, this.dictTypeForm).then(res => {
            let isSuccess = res.status == 200;
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "修改成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });
            if (isSuccess) {
              this.isFormDialog = false;
              this.init();
            }
          });
        } else {
          postDictType(this.dictTypeForm).then(res => {
            let isSuccess = res.status == 200;
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "添加成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });

            if (isSuccess) {
              this.isFormDialog = false;
              this.init();
            }
          });
        }
      });
    },
    openForm(newForm) {
      this.dictTypeForm = dictTypeForm;
      this.isFormDialog = true;
      this.$nextTick(() => {
        this.$refs.dictTypeForm && this.$refs.dictTypeForm.resetFields();
        if (newForm) {
          this.dictTypeForm = newForm;
        }
      });
    },
    resetDictTypeForm() {
      this.dictTypeForm = {
        code: "",
        name: ""
      };
    },
    resetDictValueForm() {
      this.dictValueForm = {
        code: undefined,
        labelDefault: undefined,
        labelEnUs: undefined,
        labelZhCh: undefined,
        value: undefined,
        orderNum: 0
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.main {
  height: 100% !important;
  .rowMain {
    height: 100% !important;
    .app-container {
      height: 100%;
      border-radius: 0px;
      box-shadow: none;
    }
  }

  .aside {
    height: 100% !important;
    border-right: #e1e1e1 solid 1px;
    background-color: #fafbfb;
    overflow: scroll;
    .titleBox {
      height: 46px;
      line-height: 46px;
      margin-left: 5px;
      margin-right: 5px;
    }
  }
  .filter-tree {
    background-color: #fafbfb;
    border-top: #e1e1e1 solid 1px;
    padding: 0px 5px;
    font-size: 13px;
    color: #333;
    .dict-item {
      position: relative;
      flex: 1;
      height: 100%;
      .more {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        .icon {
          display: inline-block;
          height: 100%;
        }
      }
    }
  }
}
.filter-container {
  background-color: #fafbfb;
  margin: 0px;
  .form {
    background-color: #fafbfb;
    height: 46px;
    line-height: 46px;
    overflow: hidden;
    font-size: 0;
    .el-form-item {
      height: auto;
      line-height: 100%;
      margin: 4px 0 0;
      font-size: 0;
      .el-button {
        margin: 3px;
      }
    }
  }
}
.el-pagination {
  padding: 10px 0 10px 10px;
}
/deep/ {
  .el-tree-node.is-current {
    & > .el-tree-node__content {
      background-color: #d5e6f9;
    }
  }
  .el-tree-node__content {
    display: flex;
    &:hover {
      background-color: #e7eff8;
    }
    .el-tree-node__expand-icon {
      margin-top: 0;
    }
  }
}
</style>

