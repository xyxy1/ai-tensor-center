<template>
  <el-dialog :title="id?'编辑布控':'添加布控'" class="task-form body0" :visible.sync="isFormDialog" width="640px">
    <el-form :model="form" :rules="readonly?null:rules" ref="form" label-width="100px">
      <el-tabs v-model="tabsValue" tab-position="left">
        <!-- 任务信息 -->
        <el-tab-pane label="任务信息" name="first" class="first-box">
          <div class="readonly" v-if="readonly"></div>
          <el-form-item label="任务编号" prop="code">
            <el-input v-model="form.code" placeholder="编号名不能重复" />
          </el-form-item>
          <el-form-item label="任务名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入任务名称" />
          </el-form-item>
          <el-form-item label="负责人" prop="leaders">
            <responsible-select v-model="form.leaders" />
          </el-form-item>
          <el-form-item label="布控状态" prop="status">
            <el-radio v-model="form.status" label="1">在控</el-radio>
            <el-radio v-model="form.status" label="0">撤控</el-radio>
          </el-form-item>
          <el-form-item label="任务描述" prop="remark">
            <el-input type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }" v-model="form.remark" />
          </el-form-item>
          <div class="more" v-if="form.crtTime || form.updTime">
            <p v-if="form.crtTime">
              <span>创建人：{{form.crtName}}</span>创建时间：{{moment(form.crtTime, 'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss")}}</p>
            <p v-if="form.updTime">
              <span>修改人：{{form.updName}}</span>修改时间：{{moment(form.updTime, 'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss")}}</p>
          </div>
        </el-tab-pane>

        <!-- 布控设置 -->
        <el-tab-pane label="布控设置" name="second" class="second-box">
          <div class="readonly" v-if="readonly"></div>
          <el-form-item label="布控区域" prop="areas">
            <area-select v-model="form.areas" />
          </el-form-item>
          <el-form-item label="布控时间" prop="timeStart">
            <el-date-picker v-model="pickerValue" type="datetimerange" :picker-options="pickerOptions" range-separator="-" @change="onPickerChange" start-placeholder="开始日期" end-placeholder="结束日期" />
            <div class="tip">不设置时间默认为长期有效</div>
          </el-form-item>
          <el-form-item class="m0" prop="timeEnd" />
          <el-form-item label="布控库" prop="libraries">
            <librarie-select v-model="form.libraries" />
          </el-form-item>
          <el-form-item label="布控个体" prop="labels">
            <label-select v-model="form.labels" />
          </el-form-item>
          <el-form-item label="预警方式" prop="interval">
            <p>
              <el-radio v-model="form.alarmType" @change="$refs.form.validateField('interval')" label="0">捕抓到布控对象时</el-radio>
            </p>
            <p>
              <el-radio v-model="form.alarmType" @change="$refs.form.validateField('interval')" label="1">
                超过
                <el-input v-model.number="form.interval" class="custom-input" size="small" @focus="form.alarmType = '1'" />
                天未捕抓到布控对象时
              </el-radio>
            </p>
          </el-form-item>
        </el-tab-pane>

        <!-- 推送设置 -->
        <el-tab-pane label="推送设置" name="third" class="third-box">
          <div class="readonly" v-if="readonly"></div>
          <el-form-item label="推送手机号" prop="mobileNums">
            <el-input v-model="form.mobileNums" placeholder="多个手机号码用逗号隔开" />
          </el-form-item>
          <el-form-item label="短信模板" prop="smsTemplet">
            <el-select v-model="form.smsTemplet" placeholder="请选择短信模板">
              <el-option v-for="item in smsData" :key="item.id" :label="item.smsName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="APP模板" prop="appTemplet">
            <el-select v-model="form.appTemplet" placeholder="请选择APP模板">
              <el-option v-for="item in appData" :key="item.id" :label="item.appName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <div slot="footer">
      <template v-if="readonly">
        <el-button size="mini" type="primary" @click="isFormDialog = false">关闭</el-button>
      </template>
      <template v-else>
        <el-button size="mini" type="primary" @click="onSubmit">保存</el-button>
        <el-button size="mini" @click="isFormDialog = false">取消</el-button>
      </template>
    </div>
  </el-dialog>
</template>
<script>
import moment from "moment";
import {
  postMonitorTask,
  putMonitorTask,
  getMonitorTask,
  getSmsSelect,
  getAppSelect
} from "@/api/bigData/monitorTask";

export default {
  components: {
    ResponsibleSelect: () => import("./ResponsibleSelect"),
    LibrarieSelect: () => import("./LibrarieSelect"),
    LabelSelect: () => import("./LabelSelect"),
    AreaSelect: () => import("./AreaSelect")
  },
  props: {
    id: Number,
    isOpen: {
      default: false,
      type: Boolean
    },
    readonly: Boolean
  },
  data() {
    let formValidateInterval = (rule, value, callback) => {
      let regexp = /(^[1-9]\d*$)/;
      if (this.form.alarmType == 0) {
        callback();
        return;
      }
      if (value.length === 0 && this.form.alarmType == 1) {
        callback("天数不能为空");
        return;
      }
      if (regexp.test(value)) {
        callback();
      } else {
        callback("天数不能小于1");
      }
    };
    let formValidatePersonnel = (rule, value, callback) => {
      if (!this.form.libraries.length && !this.form.labels.length) {
        callback("布控库或布控个体不能为空");

        if (this.form.code && this.form.name && this.form.leaders.length) {
          this.tabsValue = "second";
        }
      } else {
        callback();
      }
    };
    return {
      isFormDialog: false,
      pickerValue: [null, null],
      pickerOptions: {
        shortcuts: [
          {
            text: "一周内",
            onClick(picker) {
              picker.$emit("pick", [moment(), moment().add(7, "d")]);
            }
          },
          {
            text: "一个月内",
            onClick(picker) {
              picker.$emit("pick", [moment(), moment().add(1, "M")]);
            }
          },
          {
            text: "三个月内",
            onClick(picker) {
              picker.$emit("pick", [moment(), moment().add(3, "M")]);
            }
          }
        ]
      },

      moment: moment,
      tabsValue: "first",
      initForm: true,
      form: {
        code: null,
        name: null,
        timeStart: null,
        timeEnd: null,
        remark: null,
        status: "1",
        alarmType: "0",
        interval: 3,
        mobileNums: null,
        smsTemplet: null,
        appTemplet: null,
        labelNums: null, // 人脸库提交
        leaders: [], // 负责人
        libraries: [], // 人脸库
        areas: [], // 布控区域
        labels: [], // 布控个体
        timeFlag: "0"
      },
      rules: {
        code: { required: true, message: "任务编号不能为空" },
        name: { required: true, message: "任务名称不能为空" },
        leaders: { required: true, message: "请选择负责人" },
        areas: { required: true, message: "请选择布控区域" },
        interval: { validator: formValidateInterval },
        libraries: { validator: formValidatePersonnel },
        labels: { validator: formValidatePersonnel }
      },

      smsData: [],
      appData: []
    };
  },
  watch: {
    isOpen(val) {
      this.isFormDialog = val;
    },
    isFormDialog(val) {
      if (val) {
        this.tabsValue = "first";
        this.pickerValue = [null, null];

        // 重置表单，重置结束后开启验证
        this.initForm = true;
        this.$refs.form && this.$refs.form.resetFields();
        this.$nextTick(() => {
          this.initForm = false;
        });

        this.id && this.getFormDetail();
      }

      this.$emit("update:isOpen", val);
    },
    "form.leaders"(val) {
      if (this.initForm) {
        return;
      }

      this.$nextTick(() => {
        this.$refs.form.validateField("leaders");
      });
    },
    "form.areas"(val) {
      if (this.initForm) {
        return;
      }

      this.$nextTick(() => {
        this.$refs.form.validateField("areas");
      });
    },
    "form.libraries"() {
      if (this.initForm) {
        return;
      }

      this.$nextTick(() => {
        this.$refs.form.validateField("libraries");
        this.$refs.form.validateField("labels");
      });
    }
  },
  created() {
    this.initData();
  },
  methods: {
    async initData() {
      await getSmsSelect().then(res => {
        this.smsData = res.data;
      });
      await getAppSelect().then(res => {
        this.appData = res.data;
      });
    },
    // 获取表单详情
    getFormDetail() {
      getMonitorTask(this.id).then(res => {
        if (res.status == 200) {
          this.form = res.data;

          // 布控库处理
          this.form.libraries = this.form.libraries.map(item => {
            return {
              num: item.objectId,
              label: item.name
            };
          });
          // 时间处理
          if (this.form.timeFlag == 1) {
            this.pickerValue = [
              moment(this.form.timeStart, "YYYY-MM-DD HH:mm:ss"),
              moment(this.form.timeEnd, "YYYY-MM-DD HH:mm:ss")
            ];
            this.form.timeStart = moment(this.pickerValue[0]).format(
              "YYYYMMDDHHmmss"
            );
            this.form.timeEnd = moment(this.pickerValue[1]).format(
              "YYYYMMDDHHmmss"
            );
          }
        }
      });
    },
    onSubmit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return false;

        let _form = Object.assign({}, this.form);
        // 负责人数据处理
        _form.leaders = _form.leaders.filter(item => !(item.id && item.leader));
        // 布控区域数据处理
        _form.areasStr = _form.areas.map(item => item.communityCode).join(",");
        // 人脸库数据处理
        _form.labelNums = _form.libraries.map(item => item.num).join(",");
        // 布控个体
        _form.labels = _form.labels.filter(item => !(item.id && item.objectId));

        if (this.id) {
          // 修改
          _form.id = this.id;
          putMonitorTask(_form).then(res => {
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
          postMonitorTask(_form).then(res => {
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
      });
    },
    // 日期选择器变更
    onPickerChange(date) {
      if (date) {
        this.form.timeStart = moment(date[0]).format("YYYYMMDDHHmmss");
        this.form.timeEnd = moment(date[1]).format("YYYYMMDDHHmmss");
      } else {
        this.form.timeStart = null;
        this.form.timeEnd = null;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.task-form {
  .m0 {
    margin: 0;
  }
  .readonly {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 999999;
  }
  .tip {
    line-height: 100%;
    padding: 6px 0;
    font-size: 12px;
    color: #666;
  }
  .el-select {
    width: 100%;
  }
  .el-date-editor {
    width: 100%;
  }
  /deep/ {
    .el-tabs {
      height: 480px;
    }
    .el-tabs__header {
      background: #fafbfd;
      height: 100%;
      margin-right: 0;
      border-right: 1px solid #e5e5e5;
    }
    .el-tabs__content {
      height: 100%;
      padding: 20px 30px 0 0;
      overflow: auto;
    }
    .el-tabs__nav-wrap {
      margin: 0;
      &:after {
        content: none;
      }
    }
    .el-tabs__active-bar {
      display: none;
    }
    .el-tabs__item {
      min-width: 120px;
      border-bottom: 1px solid #e5e5e5;
      text-align: left;
      font-size: 13px;
      color: #333;
      &.is-active,
      &:hover {
        background: #0fa0ff;
        color: #fff;
      }
    }
  }

  .first-box {
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
  }
  .second-box {
    .custom-input {
      width: 60px;
    }
    .threshold {
      position: relative;
      .el-slider {
        padding: 0 46px 0 8px;
      }
      .txt {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 13px;
        font-weight: bold;
        color: #3f4041;
      }
    }
  }
}
</style>