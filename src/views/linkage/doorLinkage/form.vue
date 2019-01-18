<template>
  <div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :model="form" ref="form" label-width="80px" style="width: 92%">
        <el-form-item label="代码 " prop="accessCode">
          <el-input v-model="form.accessCode" placeholder="请输入代码"></el-input>
        </el-form-item>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="名称" prop="accessName">
              <el-input v-model="form.accessName" placeholder="请输入名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="频率(S)" prop="accessFrequency">
              <el-input v-model="form.accessFrequency" placeholder="请输入调用频率"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="地址" prop="accessUrl">
          <el-input v-model="form.accessUrl" placeholder="请输入url地址"></el-input>
        </el-form-item>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="类型 " prop="accessType">
              <el-switch v-model="form.accessType" active-color="#C9C9C9" inactive-color="#13ce66" active-text="出" inactive-text="进" :active-value="'0'" :inactive-value="'1'">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label-width="0" prop="accessAble">
              <el-switch v-model="form.accessAble" active-color="#C9C9C9" inactive-color="#13ce66" active-text="禁用" inactive-text="启用" :active-value="'0'" :inactive-value="'1'">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="accessDesc">
          <el-input v-model="form.accessDesc" type="textarea" placeholder="请输入备注..."></el-input>
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
  putObj
} from "@/api/Linkage/doorLinkage/index";
export default {
  data() {
    return {
      options: [
        {
          value: "选项1",
          label: "进"
        },
        {
          value: "选项2",
          label: "出"
        }
      ],
      options1: [
        {
          value: "选项1",
          label: "启用"
        },
        {
          value: "选项2",
          label: "禁用"
        }
      ],
      form: {
        accessCode: undefined,
        accessName: undefined,
        accessUrl: undefined,
        accessFrequency: 5,
        accessType: undefined,
        accessAble: undefined,
        mlphId: undefined,
        accessDesc: undefined
      },
      dialogStatus: undefined,
      textMap: {
        update: "编辑",
        create: "创建"
      },
      dialogFormVisible: false
    };
  },
  methods: {
    open(form, dialogStatus) {
      this.dialogFormVisible = true;
      this.form = form;
      this.dialogStatus = dialogStatus;
    },
    create(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          addObj(this.form).then(response => {
            if (response.status === 200) {
              this.dialogFormVisible = false;
              this.$emit("afterSave", {});
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    cancel(formName) {
      this.dialogFormVisible = false;
      this.$refs[formName].resetFields();
    },
    update(formName) {
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false;
          this.form.password = undefined;
          putObj(this.form.id, this.form).then(response => {
            if (response.status === 200) {
              this.dialogFormVisible = false;
              this.$emit("afterSave", {});
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
            }
          });
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style scoped>
</style>
