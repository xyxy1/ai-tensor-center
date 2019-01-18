<template>
  <div class="community-manage">
    <!-- 省市县 -->
    <div class="header">
      <label>区域：</label>
      <el-cascader size="mini" placeholder="请选择省市县" :options="cascaderOptions" :props="cascaderProps" v-model="currentArea" clearable filterable change-on-select />
    </div>

    <el-row>
      <menu-tree ref="menu" :data="currentArea" :area-data="cascaderOptions" @change="onMenuChange" />
      <el-col :span="18">
        <!-- 表单筛选 -->
        <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="onSearch">
          <span>关键字</span>
          <el-form-item prop="keyword">
            <el-input size="mini" @keyup.enter.native="onSearch" placeholder="小区名称" v-model="listQuery.keyword"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" type="primary" @click="onSearch">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" @click="onResetForm">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table class="table" :data="listData.rows" height="calc(100vh - 307px)" v-loading.body="listLoading" highlight-current-row>
          <el-table-column label="小区图" align="center">
            <template slot-scope="scope">
              <img :src="scope.row.mapUrl" class="pic" @click="onLookPicture(scope.row.mapUrl)">
            </template>
          </el-table-column>
          <el-table-column label="小区名称" prop="name" align="center" />
          <el-table-column label="小区类型" min-width="80" prop="communityTypeName" align="center" />
          <el-table-column label="物业公司" min-width="80" prop="organizeName" align="center" />
          <el-table-column label="联系人" min-width="80" prop="contactName" align="center" />
          <el-table-column label="联系电话" min-width="80" prop="contactTel" align="center" />
          <el-table-column label="操作" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button type="success" size="mini" @click="onItemEdit(scope.row.id)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" :total="listData.total" layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
      </el-col>
    </el-row>

    <!-- 图片弹窗 -->
    <el-dialog title="背景大图" :visible.sync="isBgDialog">
      <img :src="rowBgImg" class="w100">
    </el-dialog>

    <!-- 编辑表格弹窗 -->
    <el-dialog title="编辑小区信息" :visible.sync="isFormDialog" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="小区名称" prop="name">
          <el-input v-model="form.name" placeholder="请填写小区名称" />
        </el-form-item>
        <el-form-item label="小区地址" prop="address">
          <el-input v-model="form.address" placeholder="请填写小区地址" />
        </el-form-item>
        <!-- 下拉选项 -->
        <el-form-item label="小区类型" prop="communityType">
          <dict-select dict-name="community_type" v-model="form.communityType" />
        </el-form-item>
        <!-- 会弹窗 -->
        <el-form-item label="经纬度">
          <el-input :value="form.lng&&form.lat?form.lng+','+form.lat:''" @focus="showMapLocation" placeholder="请选择经纬度" />
        </el-form-item>
        <el-form-item label="物业公司" prop="organizeName">
          <el-input v-model="form.organizeName" placeholder="请填写物业公司" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请填写联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactTel">
          <el-input v-model="form.contactTel" placeholder="请填写联系电话" />
        </el-form-item>
        <el-form-item label="小区简介" prop="description">
          <el-input type="textarea" resize="none" :autosize="{ minRows: 4 }" v-model="form.description" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">保 存</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 经纬度选择器 -->
    <map-location ref="locationDialog" :zoom="18" @local="setLocation" />
  </div>
</template>
<script>
import {
  getAreaTree,
  getCommunityList,
  putCommunity,
  getCommunity
} from "@/api/bigData/responsibilityArea";

export default {
  components: {
    MenuTree: () => import("./menuTree")
  },
  data: () => ({
    currentRow: {},
    currentArea: [],
    cascaderOptions: [],
    cascaderProps: {
      value: "code"
    },

    isBgDialog: false, // 控制背景图显示
    rowBgImg: null,

    listData: {},
    listQuery: {
      offset: 1,
      limit: 15,
      sqjcwhCode: null,
      xzjdCode: null,
      keyword: null
    },
    rules: {},
    form: {
      lng: null,
      lat: null,
      name: null,
      mapUrl: null,
      address: null,
      contactTel: null,
      description: null,
      contactName: null,
      organizeName: null,
      communityType: null
    },
    isFormDialog: false,
    listLoading: false
  }),
  methods: {
    init() {
      getAreaTree().then(res => {
        if (res.status == 200) {
          this.cascaderOptions = res.data;
        }
      });
    },
    // 获取表格数据
    getTableList() {
      this.formId = null;
      this.listLoading = true;
      getCommunityList(this.listQuery)
        .then(res => {
          this.listData = res.data;
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.listQuery.limit = 15;
      this.getTableList();
    },
    // 列表参数重置
    onResetForm() {
      this.listQuery = {
        sqjcwhCode: null,
        xzjdCode: null,
        offset: 1,
        limit: 15,
        keyword: null
      };
    },
    onItemEdit(id) {
      getCommunity(id).then(res => {
        if (res.status == 200) {
          this.form = res.data;
        }
      });
      this.isFormDialog = true;
    },
    onMenuChange(row) {
      this.currentRow = row;
      if (row.type == "townStreet") {
        this.listQuery.xzjdCode = row.code;
        this.listQuery.sqjcwhCode = null;
      }
      if (row.type == "neighborhood") {
        this.listQuery.xzjdCode = null;
        this.listQuery.sqjcwhCode = row.code;
      }
      this.getTableList();
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return false;
        
        putCommunity(this.form.id, this.form).then(res => {
          let isSuccess = res.status == 200;
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "修改成功" : "修改失败",
            type: isSuccess ? "success" : "error",
            duration: 2000
          });

          if (isSuccess) {
            this.isFormDialog = false;
            this.getTableList();
          }
        });
      });
    },
    // 经纬度
    showMapLocation() {
      this.$refs.locationDialog.open({
        lng: this.form.lng,
        lat: this.form.lat
      });
    },
    // 返回经纬度设置
    setLocation(location) {
      this.form = Object.assign({}, this.form, {
        lng: location.lng,
        lat: location.lat
      });
    },
    // 分页更新
    onListLimit(val) {
      this.listQuery.limit = val;
      this.getTableList();
    },
    // 分页更新
    onListPaging(val) {
      this.listQuery.offset = val;
      this.getTableList();
    },
    // 查看大图
    onLookPicture(img) {
      this.rowBgImg = img;
      this.isBgDialog = true;
    }
  }
};
</script>
<style lang="scss" scoped>
.community-manage {
  height: 100%;
  .w100 {
    width: 100%;
  }
  .el-row {
    height: calc(100% - 46px);
    border-top: 1px solid #e1e1e1;
    .el-col {
      height: 100%;
    }
  }
  .header {
    height: 46px;
    line-height: 26px;
    padding: 10px 0;
    overflow: hidden;
    font-size: 0;
    label {
      display: inline-block;
      padding: 0 2px 0 10px;
      text-align: right;
      font-size: 13px;
      font-weight: normal;
      color: #3f4041;
    }
    .el-cascader {
      width: 320px;
    }
  }
  .form {
    background: #fafbfd;
    height: 46px;
    line-height: 46px;
    padding: 0 12px;
    span {
      display: inline-block;
      margin-right: 8px;
      vertical-align: top;
      font-size: 13px;
      color: #3f4041;
    }
    .el-form-item {
      height: auto;
      line-height: 100%;
      margin: 4px 0 0;
      font-size: 0;
    }
  }
  .table {
    border-top: 1px solid #e1e1e1;
    .el-button {
      margin: 0;
    }
    .pic {
      display: block;
      height: 60px;
      margin: 0 auto;
    }
  }
  .el-pagination {
    padding: 10px;
  }
}
</style>