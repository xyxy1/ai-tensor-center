<template>
  <div class="police-form">
    <el-dialog :title="id?'编辑派出所':'添加派出所'" :visible.sync="isFormDialog" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <template v-if="id">
          <el-form-item label="所属区域" prop="xzqName">
            <el-input v-model="form.xzqName" readonly />
          </el-form-item>
          <el-form-item prop="xzqCode" class="m0" />
        </template>
        <template v-else>
          <el-form-item prop="xzqName" class="m0" />
          <el-form-item label="所属区域" prop="xzqCode">
            <el-cascader placeholder="请选择所属区域" :options="areaData" :props="cascaderProps" @change="onCascaderChange" :show-all-levels="false" clearable filterable v-if="isFormDialog" />
          </el-form-item>
        </template>
        <el-form-item label="派出所编码" prop="code">
          <el-input v-model="form.code" placeholder="请填写派出所编码" />
        </el-form-item>
        <el-form-item label="派出所名称" prop="name">
          <el-input v-model="form.name" placeholder="请填写派出所名称" />
        </el-form-item>
        <el-form-item label="派出所地址" prop="address">
          <el-input v-model="form.address" placeholder="请填写派出所地址" />
        </el-form-item>
        <el-form-item label="派出所电话" prop="tel">
          <el-input v-model="form.tel" placeholder="请填写派出所电话" />
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
  postPolice,
  putPolice,
  getPolice
} from "@/api/bigData/responsibilityArea";

export default {
  props: {
    id: Number,
    isOpen: {
      default: false,
      type: Boolean
    },
    areaData: Array
  },
  data: () => ({
    cascaderProps: {
      value: "code"
    },

    isFormDialog: false,
    form: {
      code: "",
      name: "",
      address: "",
      tel: "",
      xzqCode: "",
      xzqName: ""
    },
    rules: {
      code: { required: true, message: "请输入派出所编码" },
      name: { required: true, message: "请输入派出所名称" },
      xzqCode: { required: true, message: "请输入所属区域 " }
    }
  }),
  watch: {
    isOpen(val) {
      this.isFormDialog = val;
    },
    isFormDialog(val) {
      if (val) {
        this.$refs.form && this.$refs.form.resetFields();

        if (this.id) {
          getPolice(this.id).then(res => {
            if (res.status === 200) {
              this.form = res.data;
            }
          });
        }
      }
      this.$emit("update:isOpen", val);
    }
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.id) {
            let _form = Object.assign(this.form, { id: this.id });

            putPolice(_form).then(res => {
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
            postPolice(this.form).then(res => {
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
    onCascaderChange(val) {
      this.form.xzqCode = val[2];
    }
  }
};
</script>
<style lang="scss" scoped>
.police-form {
  .m0 {
    margin: 0;
  }
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
  .el-cascader {
    width: 100%;
  }
}
</style>
