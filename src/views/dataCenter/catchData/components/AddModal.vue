<template>
    <div class="container">
      <span @click="toggleModal">
        <slot></slot>
      </span>
      <el-dialog title="添加" :visible.sync="showModal">
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form :model="formData" :rules="rules" ref="ruleForm">
              <el-input type="hidden" v-model="formData.id"></el-input>
              <el-form-item label="证件号" label-width="100px" prop="identityNo">
                <el-input v-model="formData.identityNo"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showModal = false">取 消</el-button>
          <el-button type="primary" @click="okHandle('ruleForm')">确 定</el-button>
        </div>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: "AddModal",
  props: ["id"],
  data() {
    return {
      showModal: false,
      formData: {},
      rules: {
        identityNo: [{ required: true, message: "请输入证件号", trigger: "blur" }]
      }
    };
  },
  methods: {
    toggleModal() {
      if (!this.showModal) {
          this.formData.id = this.id;
      }
      this.showModal = !this.showModal;
    },
    okHandle(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$emit("save", this.formData);
          this.showModal = false;
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  display: inline-block;
}
</style>
