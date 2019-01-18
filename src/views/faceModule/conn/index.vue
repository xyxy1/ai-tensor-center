<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
    <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="请输入摄像头编码" v-model="listQuery.cameraCode"> </el-input>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="请输入回调地址" v-model="listQuery.callbackUrl"> </el-input>
      <el-button class="filter-item" type="primary"  @click="handleFilter">搜索</el-button>
    </div>
    <el-table :key='tableKey' :data="list" v-loading.body="listLoading" height="calc(100vh - 238px)" highlight-current-row style=" width: 100%;">
      <el-table-column  fixed="left" align="center" label="摄像头编码" >
        <template slot-scope="scope">
          <span>{{scope.row.cameraCode}}</span>
        </template>
      </el-table-column>
      <el-table-column  width="180px" align="center" label="摄像头名称">
        <template slot-scope="scope">
          <span>{{scope.row.cameraName}}</span>
        </template>
      </el-table-column>
      <el-table-column  width="350px" align="center" label="回调地址">
        <template slot-scope="scope">
          <span>{{scope.row.callbackUrl}}</span>
        </template>
      </el-table-column>
      <el-table-column  width="250px" align="center" label="最后心跳时间" >
        <template slot-scope="scope">
          <span>{{scope.row.connTime}}</span>
        </template>
      </el-table-column>
      <el-table-column  width="150px" align="center" label="创建人">
        <template slot-scope="scope">
          <span>{{scope.row.crtUserName}}</span>
        </template>
      </el-table-column>
      <el-table-column  width="250px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{scope.row.crtTime}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.offset" :page-sizes="[25,100,250]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </div>
  </div>
</template>

<script>
  import {
    page
    // addObj,
    // getObj,
    // delObj,
    // putObj
  } from '@/api/faceModule/conn/index';
  import { mapGetters } from 'vuex';
  export default {
    name: 'face-conn',
    data() {
      return {
        form: {
          cameraCode: undefined,
          cameraName: undefined,
          callbackUrl: undefined,
          connTime: undefined,
          crtUserName: undefined,
          crtTime: undefined
        },
        list: null,
        listEnd: [],
        filterList: [],
        total: null,
        listLoading: false,
        listQuery: {
          offset: 1,
          limit: 25,
          callbackUrl: undefined,
          cameraCode: undefined
        },
        tableKey: 0
      }
    },
    created() {
      this.getList();
    },
    computed: {
      ...mapGetters([
        'elements'
      ])
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
      }
    }
  }
</script>

