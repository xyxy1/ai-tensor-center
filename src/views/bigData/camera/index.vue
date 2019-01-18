<template>
  <div class="app-container">
    <el-row class="main">
      <server-menu ref="serverMenu" @change="onMenuChange" />

      <el-col :span="19" class="right-box">
        <!-- 表单筛选 -->
        <el-form class="form" ref="listForm" :model="listQuery" :inline="true" @keyup.enter.native="onSearch">
          <span>关键字</span>
          <el-form-item prop="keyword">
            <el-input size="mini" @keyup.enter.native="onSearch" placeholder="名称/代码" v-model="listQuery.keyword"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" type="primary" @click="onSearch">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" @click="onResetForm">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 工具栏 -->
        <div class="common-tool">
          <div class="title">
            摄像头
            <em>{{listData.total?listData.total:0}}</em>
          </div>
          <div class="right">
            <el-button class="txt-btn" size="mini" type="text" icon="el-icon-plus" @click="onItemEdit()">添加</el-button>
            <el-button class="txt-btn" size="mini" type="text" icon="el-icon-delete" @click="onItemDelete">删除</el-button>
          </div>
        </div>

        <!-- 表格模式 S -->
        <el-table ref="listTabel" :data="listData.rows" height="calc(100vh - 255px)" v-loading.body="listLoading" highlight-current-row @selection-change="onListChange">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="cameraName" label="名称" align="center" />
          <el-table-column prop="cameraBrand" label="品牌" align="center" />
          <el-table-column prop="cameraCode" label="编码" align="center" />
          <el-table-column prop="apeType" label="设备类型" align="center" />
          <el-table-column fixed="right" min-width="70" align="center" label="操作">
            <template slot-scope="scope">
              <el-button size="mini" type="success" @click="onItemEdit(scope.row.id)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 表格模式 E -->

        <el-pagination @size-change="onListLimit" @current-change="onListPaging" :current-page.sync="listQuery.offset" :page-sizes="[15,30,50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="listData.total"></el-pagination>
      </el-col>
    </el-row>

    <!-- 表单编辑 -->
    <el-dialog :title="form.id?'编辑':'添加'" class="form-layer" :visible.sync="isFormDialog" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item class="m0" prop="lat"></el-form-item>
        <el-form-item class="m0" prop="apsName"></el-form-item>
        <el-form-item class="m0" prop="communityCode"></el-form-item>
        <el-form-item label="名称" prop="cameraName">
          <el-input v-model="form.cameraName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="摄像头编码" prop="cameraCode">
          <el-input v-model="form.cameraCode" placeholder="请输入摄像头编码" />
        </el-form-item>
        <el-form-item label="经纬度" prop="lng">
          <el-input :value="form.lng&&form.lat?form.lng+','+form.lat:''" placeholder="请选择经度" @focus="showMapLocation"></el-input>
        </el-form-item>
        <el-form-item label="注册码" v-if="form.id">
          <el-input :value="form.apeCode" disabled />
        </el-form-item>
        <el-form-item label="所属应用" prop="apsId">
          <el-input :value="form.apsName" placeholder="请选择设备" readonly @focus="isApeDialog = true" />
        </el-form-item>
        <el-form-item label="设备类型" prop="apeType">
          <dict-select dict-name="acquisition_equipment_type" v-model="form.apeType"/>
        </el-form-item>
        <el-form-item label="品牌" prop="cameraBrand">
          <el-select v-model="form.cameraBrand">
            <el-option value="DH" label="AI-TENSOR-DH"></el-option>
            <el-option value="HK" label="AI-TENSOR-HK"></el-option>
            <el-option value="JG" label="AI-TENSOR-JG"></el-option>
            <el-option value="YS" label="AI-TENSOR-YS"></el-option>
            <el-option value="SB" label="AI-TENSON-SB"></el-option>
            <el-option value="QT" label="AI-TENSOR-QT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="尾随联动" prop="dangleAfterFlag" class="m0">
          <el-switch v-model="form.dangleAfterFlag" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">保 存</el-button>
        <el-button size="mini" @click="isFormDialog = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 经纬度选择器 -->
    <map-location ref="locationDialog" :zoom="18" @local="setLocation" />

    <!-- 门牌楼号选择层 -->
    <ape-form :is-open.sync="isApeDialog" @complete="onApeUpdate" />
  </div>
</template>
<script>
import {
  getCameraList,
  postCamera,
  deleteCamera,
  putCamera,
  getCamera
} from "@/api/bigData/camera/index";

export default {
  name: "bigData-camera",
  components: {
    ServerMenu: () => import("./components/ServerMenu"),
    ApeForm: () => import("./components/ApeForm")
  },
  data: () => ({
    isApeDialog: false,
    isFormDialog: false,
    form: {
      id: null,
      cameraName: null,
      cameraCode: null,
      communityCode: null,
      lng: null,
      cameraBrand: null,
      lat: null,
      apsId: null,
      apsName: null,
      apeType: null,
      dangleAfterFlag: 0
    },
    rules: {
      apsId:{required: true, message: "所属应用不能为空" },
      cameraName: { required: true, message: "名称不能为空" },
      cameraCode: { required: true, message: "摄像头编码不能为空" },
      lng: { required: true, message: "经纬度不能为空" }
    },

    listQuery: {
      offset: 1,
      limit: 15,
      keyword: null,
      communityCode: null
    },
    listIds: [],
    listData: {},
    listLoading: false
  }),
  created() {},
  methods: {
    updateView() {
      this.$refs.serverMenu.menuList();
      this.getTableList();
    },
    onMenuChange(row) {
      this.listQuery.communityCode = row.communityCode;
      this.getTableList();
    },
    // 获取表格数据
    getTableList() {
      this.listLoading = true;

      getCameraList(this.listQuery)
        .then(res => {
          if (res.status === 200) {
            this.listData = res.data;
          }
        })
        .finally(err => {
          this.listLoading = false;
        });
    },
    onSearch() {
      this.listQuery.offset = 1;
      this.listQuery.limit = 15;
      this.getTableList();
    },
    onItemEdit(id) {
      this.form.id = id || null;

      this.isFormDialog = true;
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields();
        this.apsName = null;
      });

      if (this.form.id) {
        getCamera(this.form.id).then(res => {
          if (res.status === 200) {
            this.form = res.data;
          }
        });
      }
    },
    onItemDelete() {
      if (!this.listIds.length) {
        this.$notify({
          title: "提示",
          message: "请选择需要删除的数据",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.$confirm("此操作将永久删除, 是否继续?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonClass: "el-button--mini",
        cancelButtonClass: "el-button--mini fr",
        type: "warning"
      }).then(() => {
        deleteCamera({ ids: this.listIds }).then(res => {
          let isSuccess = res.status === 200;
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "删除成功" : res.message,
            type: isSuccess ? "success" : "error",
            duration: 2000
          });
          if (isSuccess) {
            this.updateView();
          }
        });
      });
    },

    /* 以下表单处理 */
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.id) {
            putCamera(this.form).then(res => {
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
                this.updateView();
              }
            });
          } else {
            // 新增
            this.form.communityCode = this.listQuery.communityCode;
            postCamera(this.form).then(res => {
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
                this.updateView();
              }
            });
          }
        }
      });
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
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
    // 列表参数重置
    onResetForm() {
      this.$refs.listForm.resetFields();
      this.getTableList();
    },
    // 设置经纬度
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
    // 更新设备id
    onApeUpdate(data) {
      this.form.apsId = data.id;
      this.form.apsName = data.name;
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container,
.main {
  height: 100%;
  & > .el-col {
    min-height: 100%;
  }
  .w100 {
    width: 100%;
  }
}
.right-box {
  .el-button {
    margin-left: 0;
  }
  .el-pagination {
    padding: 10px;
  }
  .info {
    line-height: 140%;
    label {
      font-size: 14px;
    }
    p {
      color: #9da5af;
    }
  }
  a {
    font-size: 13px;
    color: #3a8dea;
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
.form-layer {
  .m0 {
    margin: 0 !important;
  }
}
</style>