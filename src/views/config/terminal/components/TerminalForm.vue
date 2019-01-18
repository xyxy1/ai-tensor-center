<template>
  <div class="terminal-form">
    <el-dialog :title="id?'编辑':'添加'" :visible.sync="isFormDialog" width="600px">
      <el-form :model="form" :rules="rules" ref="form" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="序列号" prop="serial">
              <el-input v-model="form.serial" placeholder="请输入序列号" :readonly="id"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="purpose">
              <el-select v-model="form.purpose" placeholder="请选择">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                  {{ item.label }}
                  <span class="select-right-box">{{ item.value }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="型号" prop="model">
              <el-input v-model="form.model" placeholder="请输入型号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="form.brand" placeholder="请输入品牌"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ip" prop="ip">
              <el-input v-model="form.ip" placeholder="请输入ip地址"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="mac" prop="mac">
              <el-input v-model="form.mac" placeholder="请输入mac地址"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="tvCode" prop="tvCode">
              <el-input v-model="form.tvCode" placeholder="请输入TeamViewer账号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路数上限" prop="supportMax">
              <el-input v-model="form.supportMax" placeholder="请输入路数上限" :readonly="id"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授权部门" prop="departId">
              <el-input v-model="departName" placeholder="请选择授权部门" readonly @focus="onOpenDepartTree"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="desc" class="m0">
              <el-input type="textarea" resize="none" :autosize="{ minRows: 3 }" v-model="form.desc" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">保 存</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 选择部门 -->
    <el-dialog title="授权部门" class="depart-layer" :visible.sync="isDepartDialog" width="400px">
      <el-input placeholder="输入关键字进行过滤" v-model="departFilterName"></el-input>
      <el-tree ref="departTree" class="filter-tree" node-key="id" :data="departTreeData" show-checkbox highlight-current default-expand-all check-strictly :expand-on-click-node="false" :filter-node-method="onFilterNode" @check-change="onDepartChange">
        <div class="tree-item" slot-scope="{ node, data }">
          <svg-icon icon-class="group" />
          <span>{{node.label}}</span>
        </div>
      </el-tree>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onDepartUpdate">保存</el-button>
        <el-button size="mini" @click="isDepartDialog = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { addObj, getObj, putObj } from "@/api/config/terminal";
import { getDepartmentTree, getDepartment } from "@/api/userManage";

export default {
  props: {
    id: Number,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  watch: {
    isOpen(val) {
      this.isFormDialog = val;
    },
    isFormDialog(val) {
      if (val) {
        this.$refs.form && this.$refs.form.resetFields();
        this.departName = null;

        if (this.id) {
          getObj(this.id).then(res => {
            if (res.status === 200) {
              this.form = res.data;

              this.form.departId &&
                getDepartment(this.form.departId).then(res => {
                  this.departName = res.data.name;
                });
            }
          });
        }
      }
      this.$emit("update:isOpen", val);
    },
    departFilterName(val) {
      this.$refs.departTree.filter(val);
    }
  },
  data: () => ({
    isFormDialog: false,
    isDepartDialog: false,
    options: [{ value: "CAP", label: "采集" }, { value: "SRV", label: "中心" }],
    departName: null,
    departTreeData: [],
    departFilterName: null,

    form: {
      serial: null,
      purpose: null,
      model: null,
      brand: null,
      ip: null,
      mac: null,
      tvCode: null,
      supportMax: null,
      departId: null,
      desc: null
    },
    rules: {
      serial: { required: true, message: "序列号不能为空" },
      purpose: { required: true, message: "类型不能为空" },
      model: { required: true, message: "型号不能为空" },
      ip: { required: true, message: "IP不能为空" },
      supportMax: { required: true, message: "路数上限不能为空" }
    }
  }),
  methods: {
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.id) {
            let _form = Object.assign({}, this.form);
            _form.id = this.id;

            putObj(_form.id, _form).then(res => {
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
                this.$emit("complete");
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
                this.$emit("complete");
              }
            });
          }
        }
      });
    },
    // 选择部门相关
    onFilterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    onDepartChange(data, checked) {
      if (this.$refs.departTree.getCheckedKeys().length > 1 && checked) {
        this.$refs.departTree.setCheckedKeys([]);
        this.$refs.departTree.setCheckedKeys([data.id]);
      }
    },
    onOpenDepartTree() {
      this.isDepartDialog = true;
      getDepartmentTree().then(res => {
        this.departTreeData = res;
        this.$refs.departTree.setCheckedKeys([this.form.departId]);
      });
    },
    onDepartUpdate() {
      let _arr = this.$refs.departTree.getCheckedNodes();
      this.departName = null;
      this.form.departId = null;

      if (_arr.length) {
        this.departName = _arr[0].label;
        this.form.departId = _arr[0].id;
      }
      this.departFilterName = null;
      this.isDepartDialog = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.terminal-form {
  .filter-tree {
    margin-top: 10px;
    height: 400px;
    overflow: auto;
  }
  .tree-item {
    display: inline-block;
    height: 100%;
    line-height: 36px;
    vertical-align: top;
    font-size: 13px;
    color: #333;
    .svg-icon {
      display: inline-block;
      height: 100%;
      margin-right: 4px;
      vertical-align: top;
      font-size: 20px;
      color: #0fa0ff;
    }
  }
}
.select-right-box {
  float: right;
  color: #8492a6;
  font-size: 13px;
}
.depart-layer {
}
</style>
