<template>
  <div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :model="form"  ref="form" label-width="100px">
        <el-form-item label="名称" prop="smsName">
          <el-input v-model="form.smsName" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="smsUrl">
          <el-input v-model="form.smsUrl" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="模板代码" prop="smsTemplateCode">
          <el-input v-model="form.smsTemplateCode" placeholder="请输入模板代码"></el-input>
        </el-form-item>
        <el-form-item label="AppId" prop="smsAppId">
          <el-input v-model="form.smsAppId" placeholder="请输入AppId"></el-input>
        </el-form-item>
        <el-form-item label="AppPwd" prop="smsAppPasswd">
          <el-input v-model="form.smsAppPasswd" placeholder="请输入AppPwd"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="smsPhones">
          <el-input v-model="form.smsPhones" placeholder="请输入手机号码,多个用逗号隔开"></el-input>
        </el-form-item>
        <el-form-item label="频率(S)" prop="smsFrequency">
          <el-input v-model="form.smsFrequency" placeholder="请输入调用频率"></el-input>
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
    page, addObj, getObj, delObj, putObj} from '@/api/Linkage/msgLinkage/index';
  export default {
    data(){
      return {
        form: {
          smsName: undefined,
          smsUrl: undefined,
          smsTemplateCode: undefined,
          smsFrequency: undefined,
          smsAppId: undefined,
          smsPhones: undefined,
          smsAppPasswd: undefined
        },
        dialogStatus: undefined,
        textMap: {
          update: '编辑',
          create: '创建'
        },
        dialogFormVisible: false
      }
    },
    methods:{
      open(form, dialogStatus) {
        this.dialogFormVisible = true;
        this.form = form;
        this.dialogStatus = dialogStatus;
      },
      create(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            addObj(this.form).then( response  => {
              if(response.status === 200) {
                this.dialogFormVisible = false;
                this.$emit('afterSave', {});
                this.$notify({
                  title: '成功',
                  message: '创建成功',
                  type: 'success',
                  duration: 2000
                });
              }
            })
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
              if(response.status === 200) {
                this.dialogFormVisible = false;
                this.$emit('afterSave', {});
                this.$notify({
                  title: '成功',
                  message: '创建成功',
                  type: 'success',
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
  }
</script>

<style scoped>

</style>
