<template>
  <div class="dialog-list">
    <el-dialog :title="id?'编辑':'添加'" class="form-layer" :visible.sync="isFormDialog" width="800px">
      <div class="readonly" v-if="readonly"></div>
      <el-form :model="form" ref="form" :rules="readonly?null:rules" label-width="100px">
        <el-row>
          <el-col :span="4" class="left-box">
            <el-form-item label-width="0" prop="identityImgShow" class="pic">
              <img-show :img-src="form.identityImgShow" txt="暂无证件照" width="120px" height="148px" base64></img-show>
            </el-form-item>
            <el-upload class="upload" action="" accept=".jpeg,.jpg,.png,.bmp" :auto-upload="false" :show-file-list="false" :on-change="onUpload" v-if="!readonly">
              <el-button size="small">上传证件照</el-button>
            </el-upload>
          </el-col>
          <el-col :span="20" class="right-box">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="form.name" placeholder="请输入姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="证件号" prop="identityNo">
                  <el-input v-model="form.identityNo" placeholder="请输入18位身份证号" minlength="18" maxlength="18" @input="onAutomaticFill" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别" prop="sex">
                  <dict-select dict-name="comm_sex" v-model="form.sex" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电话" prop="tel">
                  <el-input v-model="form.tel" placeholder="请输入联系方式" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="类型" prop="labelNums">
                  <el-select v-model="labelSelect" placeholder="请选择" multiple collapse-tags>
                    <el-option v-for="item in labelData" :key="item.num" :label="item.label" :value="item.num+''" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="籍贯" prop="nativePlace">
                  <el-input v-model="form.nativePlace" placeholder="请输入籍贯" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="住户类型" prop="type">
                  <dict-select dict-name="label_type" v-model="form.type" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="与业主关系" prop="relation">
                  <dict-select dict-name="label_relation" v-model="form.relation" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="民族" prop="nation">
                  <dict-select dict-name="comm_nation" v-model="form.nation" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生日" prop="birth">
                  <el-date-picker v-model="datePickerBirth" format="yyyy-MM-dd" type="date" placeholder="生日" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="门牌楼号" prop="mlph">
                  <el-input v-model="form.mlph.content" placeholder="请选择门牌楼号" @focus="isMlphDialog = true" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="证件地址" prop="address">
                  <el-input v-model="form.address" placeholder="请输入证件地址" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="现住址" prop="actualAddress">
                  <el-input v-model="form.actualAddress" placeholder="现住址" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="人像库" prop="labelImages">
                  <div class="tip">请上传3～5张清晰正面的人脸照片，每张照片在200k以内<span v-if="fileList.length" @click="isPicListDialog = true">查看大图</span></div>
                  <el-upload class="pic-list" ref="uploadList" :limit="5" :file-list="fileList" :on-exceed="onUploadExceed" :on-change="onUploadChange" :before-remove="onUploadRemore" action="" accept=".jpeg,.jpg,.png,.bmp" list-type="picture-card" :auto-upload="false" :multiple="true">
                    <i class="el-icon-plus"></i>
                  </el-upload>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注" class="m0" prop="remark">
                  <el-input type="textarea" resize="none" :autosize="{ minRows: 3 }" v-model="form.remark" />
                </el-form-item>
                <el-form-item prop="crtName" class="m0" />
                <el-form-item prop="crtTime" class="m0" />
                <el-form-item prop="updName" class="m0" />
                <el-form-item prop="updTime" class="m0" />
              </el-col>
            </el-row>
            <div class="more" v-if="form.crtTime || form.updTime">
              <p v-if="form.crtTime">
                <span>创建人：{{form.crtName}}</span>创建时间：{{moment(form.crtTime, 'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss")}}</p>
              <p v-if="form.updTime">
                <span>修改人：{{form.updName}}</span>修改时间：{{moment(form.updTime, 'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss")}}</p>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit()" v-if="!readonly">确定</el-button>
        <el-button size="mini" @click="isFormDialog = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 门牌楼号选择层 -->
    <mlph-select :is-open.sync="isMlphDialog" :data.sync="form.mlph" :disable-type="['-1','1','2']" />

    <!-- 人像库图片列表 -->
    <pic-list :is-open.sync="isPicListDialog" :data="form.labelImages" />
  </div>
</template>

<script>
import {
  getLabel,
  putLabel,
  postLabel,
  getLabelType
} from "@/api/faceModule/faceLabel/index";
import moment from "moment";

export default {
  props: {
    id: Number,
    readonly: {
      default: false,
      type: Boolean
    },
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data: () => ({
    moment: moment,
    isFormDialog: false,
    form: {
      name: null,
      identityNo: null,
      identityImgShow: null,
      nativePlace: null,
      type: null,
      relation: null,
      sex: null,
      nation: null,
      birth: null,
      tel: null,
      address: null,
      actualAddress: null,
      remark: null,
      mlphId: null,
      labelNums: null,
      labelImages: [],
      mlph: {},
      crtName: null,
      crtTime: null,
      updName: null,
      updTime: null
    },
    rules: {
      name: { required: true, message: "姓名不能为空" },
      identityImgShow: { required: true, message: "请上传证件照" },
      identityNo: { required: true, message: "证件号不能为空" },
      sex: { required: true, message: "性别不能为空" },
      tel: { required: true, message: "电话不能为空" },
      labelNums: { required: true, message: "类型不能为空" }
    },
    datePickerBirth: null,
    isUpdateIdentityImg: false,

    labelData: [],
    labelSelect: [],

    fileList: [],
    fileRemoreList: [],

    // 门楼牌号相关
    isMlphDialog: false,

    // 人像库图表列表
    isPicListDialog: false
  }),
  watch: {
    isOpen(val) {
      this.isFormDialog = val;
    },
    isFormDialog(val) {
      if (val) {
        this.labelSelect = [];
        this.fileList = [];
        this.fileRemoreList = [];
        this.datePickerBirth = null;
        this.$refs.form && this.$refs.form.resetFields();

        this.id && this.getFormDetail();
      }

      this.$emit("update:isOpen", val);
    },
    labelSelect(val) {
      this.form.labelNums = val.join(",");
      val.length &&
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.validateField("labelNums");
        });
    },
    datePickerBirth(val) {
      this.form.birth = val ? moment(val).format("YYYY-MM-DD") : "";
    }
  },
  created() {
    this.id && this.getFormDetail();
    this.getLabelType();
  },
  methods: {
    // 表单提交
    onSubmit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let _form = Object.assign({}, this.form);
          _form.mlphId = _form.mlph.id;
          _form.labelImages = await this.imgConvert(
            this.$refs.uploadList.uploadFiles
          );
          _form.labelImages = _form.labelImages.concat(this.fileRemoreList);

          delete _form.mlph;
          // 判断证件照是否更新，如果未更新清空字段
          !this.isUpdateIdentityImg && delete _form.identityImgShow;

          if (this.id) {
            // 修改
            _form.id = this.id;
            putLabel(_form).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "保存成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.$emit("complete");
                this.isFormDialog = false;
              }
            });
          } else {
            // 新增
            postLabel(_form).then(res => {
              let isSuccess = res.status === 200;
              // 提示处理
              this.$notify({
                title: isSuccess ? "成功" : "失败",
                message: isSuccess ? "新增成功" : res.message,
                type: isSuccess ? "success" : "error",
                duration: 2000
              });

              if (isSuccess) {
                this.$emit("complete");
                this.isFormDialog = false;
              }
            });
          }
        }
      });
    },
    // 图片转换
    imgConvert(fileList) {
      let _arr = [];
      return new Promise((resolve, reject) => {
        // 筛选
        let _newList = fileList.filter(file => !file.id);

        if (_newList.length) {
          _newList.map(file => {
            let reader = new FileReader();
            reader.readAsDataURL(file.raw);
            reader.addEventListener("load", () => {
              _arr.push({
                imgShow: reader.result.substr(reader.result.indexOf(",") + 1)
              });

              // 多张图片上传完成
              if (_arr.length === _newList.length) {
                resolve(_arr);
              }
            });
          });
        } else {
          resolve([]);
        }
      });
    },
    // 人像库图片删除
    onUploadRemore(file) {
      if (file.id) {
        this.fileRemoreList.push({
          id: file.id
        });
      }
    },
    // 获取表单详情
    getFormDetail() {
      this.isUpdateIdentityImg = false;
      getLabel(this.id).then(res => {
        if (res.status == 200) {
          this.form = res.data;
          this.form.mlph = this.form.mlph || {};
          this.labelSelect = this.form.labelNums.split(",");
          if (this.form.birth) {
            this.datePickerBirth = moment(this.form.birth, "YYYY-MM-DD")._d;
          }

          this.fileList = this.form.labelImages.map(item => {
            return {
              id: item.id,
              url: "data:image/jpeg;base64," + item.imgShow
            };
          });
        }
      });
    },
    // 获取类型
    getLabelType() {
      getLabelType().then(res => {
        this.labelData = res.data.rows;
      });
    },
    // 证件号上传
    onUpload(file) {
      let reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.addEventListener("load", () => {
        this.isUpdateIdentityImg = true;
        this.form.identityImgShow = reader.result.substr(
          reader.result.indexOf(",") + 1
        );
        this.$refs.form.validateField("identityImgShow");
      });
    },
    // 输入证件号后自动填充性别生日
    onAutomaticFill() {
      if (this.form.identityNo.length === 18) {
        let _arr = [
          this.form.identityNo.substring(6, 10),
          this.form.identityNo.substring(10, 12),
          this.form.identityNo.substring(12, 14)
        ];
        this.form.sex = !(parseInt(this.form.identityNo.substring(16, 17)) % 2)
          ? "woman"
          : "man";
        this.datePickerBirth = moment(_arr.join("-"), "YYYY-MM-DD")._d;
        this.$refs.form.validateField("sex");
      }
    },
    // 上传超出限制
    onUploadExceed() {
      // 提示处理
      this.$notify({
        title: "提示",
        message: "人像库最多上传5张图片",
        type: "warning",
        duration: 2000
      });
    },
    onUploadChange(file, files) {
      // 判断大小是否超过200KB
      if (file.size / 1024 > 200) {
        setTimeout(() => {
          this.$notify({
            title: "提示",
            message: `图片【${file.name}】超过200KB，请压缩后上传`,
            type: "warning",
            duration: 2000
          });
        }, 10);
        files.splice(files.length - 1, 1);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.readonly {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 99;
}
.left-box {
  .pic {
    margin-bottom: 40px;
    /deep/ {
      .el-form-item__error {
        right: 0;
        text-align: center;
      }
    }
  }
  .img-show {
    display: block;
    margin: 0 auto;
  }
  .upload {
    width: 120px;
    margin: 0 auto;
  }
  .el-button {
    width: 120px;
  }
}
.right-box {
  /deep/ {
    .el-select,
    .el-input {
      width: 100%;
    }
    .el-upload-list__item-status-label {
      display: none;
    }
  }
  .m0 {
    margin: 0;
  }
  .tip {
    font-size: 13px;
    color: #999;
    span {
      margin-left: 8px;
      border-bottom: 1px solid #0fa0ff;
      color: #0fa0ff;
      cursor: pointer;
    }
  }
  .pic-list {
    background: #f3f4f5;
    padding: 10px 10px 0;
    border-radius: 8px;
    border: 1px #e1e4e6 solid;
    /deep/ {
      .el-upload-list__item,
      .el-upload--picture-card {
        width: 48px;
        height: 48px;
        line-height: 46px;
        margin-bottom: 10px;
      }
      .el-upload-list__item {
        float: left;
      }
      .el-icon-plus {
        line-height: 46px;
      }
    }
  }
  .more {
    line-height: 160%;
    margin-top: 10px;
    text-align: center;
    font-size: 13px;
    color: #999;
    span {
      padding-right: 30px;
    }
  }
  .accesse-box {
    .left {
      float: left;
      width: 80px;
      padding-right: 12px;
      .el-button {
        width: 100%;
        line-height: 34px;
        padding: 0;
      }
    }
    .right {
      margin-left: 80px;
    }
    .accesse-item {
      float: left;
      line-height: 22px;
      margin: 6px 8px 0 0;
      padding: 0 8px;
      border: 1px solid #0fa0ff;
      border-radius: 99px;
      font-size: 12px;
      color: #0fa0ff;
    }
  }
}
</style>
