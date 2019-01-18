<template>
  <div class="terminal-form">
    <el-dialog :title="id?'编辑':'添加'" :visible.sync="isFormDialog" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item prop="communityCode" class="m0" />
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="应用ID" prop="appId">
          <el-input v-model="form.appId" placeholder="请输入应用ID"></el-input>
        </el-form-item>
        <el-form-item label="应用秘钥" prop="appSecret">
          <el-input v-model="form.appSecret" placeholder="请输入应用秘钥"></el-input>
        </el-form-item>
        <el-form-item label="系统类型" prop="apsType">
          <dict-select dict-name="aps_type" v-model="form.apsType" />
        </el-form-item>
        <el-form-item label="所属居委会" prop="sqjcwhCode">
          <el-select v-model="form.sqjcwhCode" placeholder="请选择">
            <el-option v-for="item in committee" :key="item.id" :label="item.name" :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属派出所" prop="pcsCode">
          <el-input v-model="form.pcsCode" placeholder="请输入派出所编码"></el-input>
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
import {
  postApplication,
  putApplication,
  getApplication,
  getCommittee
} from "@/api/bigData/applicationManage/index";

export default {
  props: {
    id: Number,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  created() {
    this.getCommittees();
  },
  data: () => ({
    isFormDialog: false,
    form: {
      name: null,
      appId: null,
      appSecret: null,
      apsType: null,
      sqjcwhCode: null,
      pcsCode: null,
      communityCode: null
    },
    committee: [],
    rules: {
      name: { required: true, message: "名称不能为空" },
      appId: { required: true, message: "应用ID不能为空" },
      appSecret: { required: true, message: "应用秘钥不能为空" },
      apsType: { required: true, message: "系统类型不能为空" },
      sqjcwhCode: { required: true, message: "居委会编码不能为空" }
    }
  }),
  watch: {
    isOpen(val) {
      this.isFormDialog = val;
    },
    isFormDialog(val) {
      if (val) {
        this.$refs.form && this.$refs.form.resetFields();
        this.departName = null;

        if (this.id) {
          getApplication(this.id).then(res => {
            if (res.status === 200) {
              this.form = res.data;
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
  methods: {
    getCommittees() {
      getCommittee().then(data => {
        this.committee = data;
      });
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.id) {
            let _form = Object.assign({}, this.form);
            _form.id = this.id;

            putApplication(_form).then(res => {
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
            postApplication(this.form).then(res => {
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
</style>
