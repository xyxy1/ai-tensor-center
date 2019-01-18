<template>
  <div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :model="form"  ref="form" label-width="100px">
        <el-form-item label="名称" prop="appName">
          <el-input v-model="form.appName" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="appUrl">
          <el-input v-model="form.appUrl" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="KEY " prop="appKey">
          <el-input v-model="form.appKey" placeholder="请输入KEY"></el-input>
        </el-form-item>
        <el-form-item label="EID" prop="appEid">
          <el-input v-model="form.appEid" placeholder="请输入EID"></el-input>
        </el-form-item>
        <el-form-item label="社区id" prop="appCommunityId">
          <el-input v-model="form.appCommunityId" placeholder="请输入社区id"></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="appDeviceName">
          <el-input v-model="form.appDeviceName" placeholder="请输入设备名称"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="appTo">
          <el-input v-model="form.appTo" placeholder="请输入手机号码,多个用逗号隔开"></el-input>
        </el-form-item>
        <el-form-item label="频率(S)" prop="appFrequency">
          <el-input v-model="form.appFrequency" placeholder="请输入调用频率"></el-input>
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
    page, addObj, getObj, delObj, putObj} from '@/api/Linkage/appLinkage/index';
    export default {
      data(){
          return {
            form: {
              appName: undefined,
              appUrl: undefined,
              appKey: undefined,
              appFrequency: undefined,
              quoteCount: undefined,
              appCommunityId: undefined,
              appDeviceName: undefined,
              appEid: undefined,
              updTime: undefined
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
