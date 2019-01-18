<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary">添加</el-button>
    </div>
    <el-table :key='tableKey' :data="list" height="calc(100vh - 238px)" v-loading.body="listLoading"
              highlight-current-row style=" width: 100%;">
      <el-table-column  width="150px" align="center" label="名称">
        <template slot-scope="scope">
          <span>{{scope.row.smsName}}</span>
        </template>
      </el-table-column>
      <el-table-column  width="170px" align="center" label="地址">
        <template slot-scope="scope">
          <span>{{scope.row.smsUrl}}</span>
        </template>
      </el-table-column>
      <el-table-column  width="100px" align="center" label="模板代码">
        <template slot-scope="scope">
          <span>{{scope.row.smsTemplateCode}}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" align="center" label="频率(S)">
        <template slot-scope="scope">
          <span>{{scope.row.smsFrequency}}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" align="center" label="引用次数">
        <template slot-scope="scope">
          <span>{{scope.row.quoteCount}}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" align="center" label="创建人">
        <template slot-scope="scope">
          <span>{{scope.row.crtName}}</span>
        </template>
      </el-table-column>
      <el-table-column  width="160px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{scope.row.crtTime}}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" align="center" label="修改人">
        <template slot-scope="scope">
          <span>{{scope.row.udpName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="160px" align="center" label="修改时间">
        <template slot-scope="scope">
          <span>{{scope.row.updTime}}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="small" type="primary" @click="handleTest(scope.row)">联动测试 </el-button>
          <el-button size="small" type="success" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page.sync="listQuery.offset" :page-sizes="[25,100,250]" :page-size="listQuery.limit"
                     layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </div>

    <msg-linkage-form ref="msgForm" @afterSave="getList">
    </msg-linkage-form>
  </div>
</template>

<script>
  import {
    page, addObj, getObj, delObj, putObj,getTest
  } from '@/api/Linkage/msgLinkage/index';
  import MsgLinkageForm from './form';

  export default {
    name: 'sys-msgLinkage',
    components: {MsgLinkageForm},
    data() {
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
        list: null,
        filterList: [],
        total: null,
        listLoading: true,
        listQuery: {
          offset: 1,
          limit: 25,
        },
        tableKey: 0
      }
    },
    created() {
      this.getList();
    },
    methods: {
      getList() {
        this.listLoading = true;
        page(this.listQuery).then(response => {
          this.list = response.data.rows;
          this.total = response.data.total;
          this.listLoading = false;
        })
      },
      handleFilter() {
        this.getList();
      },
      handleSizeChange(val) {
        this.listQuery.limit = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.offset = val;
        this.getList();
      },
      handleTest(data){
        getTest(data.id).then(response =>{
          this.$message({
            type: 'success',
            message: response.data
          })
        })
      },
      handleCreate() {
        this.resetTemp();
        this.$refs.msgForm.open(this.form, 'create')
      },
      handleUpdate(row) {
        getObj(row.id).then(response => {
          this.form = response.data;
          this.$refs.msgForm.open(this.form, 'update')
        });
      },
      handleDelete(row) {
        this.$confirm('此操作将永久删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delObj(row.id).then(response => {
            if(response.status === 200) {
              this.getList();
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'success',
                duration: 2000
              });
            }
            // const index = this.list.indexOf(row);
            // this.list.splice(index, 1);
          });
        });
      },
      resetTemp(){
        this.form = {
          smsName: undefined,
          smsUrl: undefined,
          smsTemplateCode: undefined,
          smsFrequency: undefined,
          smsAppId: undefined,
          smsPhones: undefined,
          smsAppPasswd: undefined
        }
      }
    }
  }
</script>

<style scoped>
.el-table .el-button {
  margin-bottom: 5px;
}
</style>
