<template>
  <div class="camera-form">
    <el-dialog title="摄像头" class="body0" :visible.sync="isFormDialog" width="700px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-tabs v-model="tabsValue" tab-position="left">
          <el-tab-pane label="基本信息" name="first">
            <el-row class="first-box">
              <el-col :span="12">
                <el-form-item label="摄像头名" prop="cameraName">
                  <el-input v-model="form.cameraName" placeholder="请输入名称"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="代码" prop="cameraCode">
                  <el-input v-model="form.cameraCode" placeholder="请输入代码"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="品牌" prop="cameraBrand">
                  <el-select v-model="form.cameraBrand" style="width: 100%">
                    <el-option value="DH" label="AI-TENSOR-DH"></el-option>
                    <el-option value="HK" label="AI-TENSOR-HK"></el-option>
                    <el-option value="JG" label="AI-TENSOR-JG"></el-option>
                    <el-option value="YS" label="AI-TENSOR-YS"></el-option>
                    <el-option value="SB" label="AI-TENSON-SB"></el-option>
                    <el-option value="QT" label="AI-TENSOR-QT"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="读取方式" prop="cameraBrand">
                  <el-select v-model="form.cameraMode" style="width: 100%">
                    <el-option value="RTSP" label="rtsp流"></el-option>
                    <el-option value="SDK" label="sdk对接"></el-option>
                    <el-option value="HZ" label="盒子"></el-option>
                    <el-option value="QT" label="其他"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item prop="cameraMode" class="m0" />
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户名" prop="cameraUser">
                  <el-input v-model="form.cameraUser" placeholder="请输入用户名"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密码" prop="cameraPasswd">
                  <el-input v-model="form.cameraPasswd" placeholder="请输入密码"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="ip" prop="cameraIp">
                  <el-input v-model="form.cameraIp" placeholder="请输入摄像头ip"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="端口" prop="cameraPort">
                  <el-input v-model="form.cameraPort" placeholder="请输入摄像头端口"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="主码流" prop="cameraRtsp">
                  <el-input v-model="form.cameraRtsp" placeholder="请输入主码流地址"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="子码流" prop="cameraLiveRtsp">
                  <el-input v-model="form.cameraLiveRtsp" placeholder="请输入子码流地址"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="区域坐标" prop="mapPosition">
                  <el-input :value="form.mapPosition" placeholder="请选择区域坐标" readonly @focus="isRegionDialog = true"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="照片" prop="cameraImage">
                  <el-upload class="upload" action="" accept=".jpeg,.jpg,.png,.bmp" :auto-upload="false" :show-file-list="false" :on-change="onUpload">
                    <img v-if="form.cameraImageUrl && !form.cameraImage" :src="form.cameraImageUrl" class="upload-show">
                    <img v-if="form.cameraImage" :src="'data:image/jpeg;base64,' + form.cameraImage" class="upload-show">
                    <el-button v-if="!form.cameraImageUrl && !form.cameraImage">上传</el-button>
                  </el-upload>
                </el-form-item>
                <el-form-item prop="cameraImageUrl" class="m0" />
              </el-col>
              <el-col :span="24">
                <el-form-item label="经纬度" prop="lng">
                  <el-input :value="form.lng&&form.lat?form.lng+','+form.lat:''" placeholder="请选择经度" @focus="showMapLocation"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="门楼牌号" prop="mlphId">
                  <el-input :value="form.mlph.content" placeholder="请选择门牌楼号" @focus="isMlphDialog = true" readonly />
                </el-form-item>
                <el-form-item prop="mlph" class="m0" />
              </el-col>
              <el-col :span="12">
                <el-form-item label="启用">
                  <el-switch v-model="form.cameraAble" active-value="1" inactive-value="0">
                  </el-switch>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注" prop="cameraDesc">
                  <el-input type="textarea" resize="none" :autosize="{ minRows: 3 }" v-model="form.cameraDesc" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="人脸参数" name="second">
            <el-row class="second-box">
              <el-col :span="24" class="heading">抓拍人脸</el-col>
              <el-col :span="8"><img src="~@/assets/camera/img1.jpg" class="example"><span></span></el-col>
              <el-col :span="16">
                <el-form-item label="人脸高度" prop="imgHeight">
                  <el-input v-model="form.imgHeight" placeholder="请输入人脸高度"></el-input>
                </el-form-item>
                <el-form-item label="人脸宽度" prop="imgWidth">
                  <el-input v-model="form.imgWidth" placeholder="请输入人脸宽度"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24" class="heading">抓拍人脸</el-col>
              <el-col :span="8"><img src="~@/assets/camera/img2.jpg" class="example"><span></span></el-col>
              <el-col :span="16">
                <el-form-item label="背景高度" prop="bgImgWidth">
                  <el-input v-model="form.bgImgWidth" placeholder="请输入背景图片高度"></el-input>
                </el-form-item>
                <el-form-item label="背景宽度" prop="bgImgHeight">
                  <el-input v-model="form.bgImgHeight" placeholder="请输入背景图片宽度"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="推送参数" name="third">
            <el-row class="third-box">
              <el-col :span="24" class="heading">
                <el-checkbox v-model="form.callbackFlag" :true-label="1" :false-label="0">外部回调推送</el-checkbox>
                <el-form-item prop="callbackFlag" class="m0" />
              </el-col>
              <el-col :span="12">
                <el-form-item label="作用标签类型" prop="callbackNums" class="m0">
                  <el-select v-model="arrForm.callbackArr" placeholder="请选择" multiple collapse-tags>
                    <el-option v-for="item in labelTypeData" :key="item.num" :label="item.label" :value="item.num+''" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="推送地址" prop="callbackUrl" class="m0">
                  <el-input v-model="form.callbackUrl" placeholder="请输入回调地址"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" class="heading">
                <el-checkbox v-model="form.accessFlag" :true-label="1" :false-label="0">门禁联动</el-checkbox>
                <el-form-item prop="accessFlag" class="m0" />
              </el-col>
              <el-col :span="12">
                <el-form-item label="作用标签类型" prop="callbackNums" class="m0">
                  <el-select v-model="arrForm.accessArr" placeholder="请选择" multiple collapse-tags>
                    <el-option v-for="item in labelTypeData" :key="item.num" :label="item.label" :value="item.num+''" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="门禁" prop="accessId" class="m0">
                  <el-select v-model="form.accessId" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in accessData" :key="item.id" :label="item.accessName" :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="24" class="heading">
                <el-checkbox v-model="form.closedFlag" :true-label="1" :false-label="0">
                  报警输出
                  <span>（专用摄像头才支持485信号，请咨询专业人员）</span>
                </el-checkbox>
                <el-form-item prop="closedFlag" class="m0" />
              </el-col>
              <el-col :span="12">
                <el-form-item label="作用标签类型" prop="closedNums">
                  <el-select v-model="arrForm.closedArr" placeholder="请选择" multiple collapse-tags>
                    <el-option v-for="item in labelTypeData" :key="item.num" :label="item.label" :value="item.num+''" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="报警通道" prop="closedChannel">
                  <el-input v-model.number="form.closedChannel"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="报警频率(秒)" prop="closedFrequency" class="m0">
                  <el-input v-model.number="form.closedFrequency"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="休眠(毫秒)" prop="closedSleep" class="m0">
                  <el-input v-model.number="form.closedSleep"></el-input>
                </el-form-item>
              </el-col>
              <el-row class="child-box">
                <el-col :span="24" class="heading">
                  <el-checkbox v-model="form.closedQuoteFlag" :true-label="1" :false-label="0">引用外部报警输出</el-checkbox>
                  <el-form-item prop="closedQuoteFlag" class="m0" />
                </el-col>
                <el-col :span="12">
                  <el-form-item label="品牌" prop="quoteCameraBrand" label-width="80px">
                    <el-select v-model="form.quoteCameraBrand" style="width: 100%">
                      <el-option value="DH" label="AI-TENSOR-DH"></el-option>
                      <el-option value="HK" label="AI-TENSOR-HK"></el-option>
                      <el-option value="JG" label="AI-TENSOR-JG"></el-option>
                      <el-option value="YS" label="AI-TENSOR-YS"></el-option>
                      <el-option value="SB" label="AI-TENSON-SB"></el-option>
                      <el-option value="QT" label="AI-TENSOR-QT"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="用户名" prop="quoteCameraUser" label-width="80px">
                    <el-input v-model="form.quoteCameraUser" placeholder="请输入用户名"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="密码" prop="quoteCameraPasswd" label-width="80px">
                    <el-input v-model="form.quoteCameraPasswd" placeholder="请输入密码"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="ip" prop="quoteCameraIp" label-width="80px">
                    <el-input v-model="form.quoteCameraIp" placeholder="请输入摄像头ip"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="端口" prop="quoteCameraPort" class="m0" label-width="80px">
                    <el-input v-model="form.quoteCameraPort" placeholder="请输入摄像头端口"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-col :span="24" class="heading">
                <el-checkbox v-model="form.smsFlag" :true-label="1" :false-label="0">短信联动</el-checkbox>
                <el-form-item prop="smsFlag" class="m0" />
              </el-col>
              <el-col :span="12">
                <el-form-item label="作用标签类型" prop="callbackNums" class="m0">
                  <el-select v-model="arrForm.smsArr" placeholder="请选择" multiple collapse-tags>
                    <el-option v-for="item in labelTypeData" :key="item.num" :label="item.label" :value="item.num+''" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="短信模板" prop="smsId" class="m0">
                  <el-select v-model="form.smsId" placeholder="请选择">
                    <el-option v-for="item in smsData" :key="item.id" :label="item.smsName" :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="24" class="heading">
                <el-checkbox v-model="form.appFlag" :true-label="1" :false-label="0">app联动</el-checkbox>
                <el-form-item prop="appFlag" class="m0" />
              </el-col>
              <el-col :span="12">
                <el-form-item label="作用标签类型" prop="callbackNums" class="m0">
                  <el-select v-model="arrForm.appArr" placeholder="请选择" multiple collapse-tags>
                    <el-option v-for="item in labelTypeData" :key="item.num" :label="item.label" :value="item.num+''" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="APP" prop="appId" class="m0">
                  <el-select v-model="form.appId" placeholder="请选择">
                    <el-option v-for="item in appData" :key="item.id" :label="item.appName" :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="24" class="heading">
                <el-checkbox v-model="form.voiceFlag" :true-label="1" :false-label="0">语音联动</el-checkbox>
                <el-form-item prop="voiceFlag" class="m0" />
              </el-col>
              <el-col :span="12">
                <el-form-item label="作用标签类型" prop="callbackNums" class="m0">
                  <el-select v-model="arrForm.voiceArr" placeholder="请选择" multiple collapse-tags>
                    <el-option v-for="item in labelTypeData" :key="item.num" :label="item.label" :value="item.num+''" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="24" class="heading">
                <el-checkbox v-model="form.connFlag" :true-label="1" :false-label="0">客户端联动</el-checkbox>
                <el-form-item prop="connFlag" class="m0" />
              </el-col>

              <el-col :span="24" class="heading">
                <el-checkbox v-model="form.dangleAfterFlag" :true-label="1" :false-label="0">尾随联动</el-checkbox>
                <el-form-item prop="dangleAfterFlag" class="m0" />
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">确定</el-button>
        <el-button size="mini" @click="isFormDialog = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 经纬度选择器 -->
    <map-location ref="locationDialog" :zoom="18" @local="setLocation" :region="mapRegionData" />

    <!-- 门牌楼号选择层 -->
    <mlph-select :is-open.sync="isMlphDialog" :data.sync="form.mlph" />

    <!-- 区域选择器 -->
    <region-location :is-open.sync="isRegionDialog" :data.sync="form.mapPosition" :id="id" />
  </div>
</template>

<script>
import { getCommunity } from "@/api/bigData/community";
import { getAccess, getSms, getApp } from "@/api/camera/index";
import { getLabelType, getmlphName } from "@/api/faceModule/faceLabel/index";

export default {
  components: {
    RegionLocation: () => import("./RegionLocation")
  },
  name: "camera-form",
  props: {
    id: Number,
    terminalId: Number,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  watch: {
    isOpen(val) {
      this.isFormDialog = val;
    },
    isFormDialog(val) {
      if (val) {
        this.initData();
        this.id && this.getFormDetail();

        this.tabsValue = "first";
        this.arrForm = {
          callbackArr: [],
          accessArr: [],
          closedArr: [],
          smsArr: [],
          appArr: [],
          voiceArr: []
        };
        this.$refs.form && this.$refs.form.resetFields();
      }
      this.$emit("update:isOpen", val);
    }
  },
  data: () => ({
    tabsValue: "first",
    isFormDialog: false,
    isMlphDialog: false,
    isRegionDialog: false,

    form: {
      cameraCode: "",
      cameraName: "",
      cameraBrand: "",
      cameraUser: "",
      cameraPasswd: "",
      cameraIp: "",
      cameraPort: "80",
      cameraRtsp: "",
      cameraLiveRtsp: "",
      cameraStatus: 1,
      cameraAble: "1",
      cameraImage: "",
      mlphId: "",
      mlph: {},
      terminalId: "",
      lng: "",
      lat: "",
      mapPosition: "",
      cameraDesc: "",
      imgWidth: "",
      imgHeight: "",
      bgImgWidth: "",
      bgImgHeight: "",
      callbackFlag: 0,
      callbackUrl: "",
      callbackNums: "",
      accessFlag: 0,
      accessId: "",
      accessNums: "",
      closedFlag: 0,
      closedNums: "",
      closedFrequency: 0,
      closedSleep: 100,
      closedChannel: 1,
      closedQuoteFlag: 0,
      quoteCameraBrand: "",
      quoteCameraUser: "",
      quoteCameraPasswd: "",
      quoteCameraIp: "",
      quoteCameraPort: "80",
      smsFlag: 0,
      smsId: "",
      smsNums: "",
      appFlag: 0,
      appId: "",
      appNums: "",
      voiceFlag: 0,
      voiceNums: "",
      connFlag: 1,
      dangleAfterFlag: 1
    },
    arrForm: {
      callbackArr: [],
      accessArr: [],
      closedArr: [],
      smsArr: [],
      appArr: [],
      voiceArr: []
    },
    rules: {
      cameraCode: {
        required: true,
        message: "请输入编码"
      },
      cameraName: {
        required: true,
        message: "请输入名称"
      },
      cameraBrand: {
        required: true,
        message: "请输入品牌"
      },
      cameraIp: {
        required: true,
        message: "请输入摄像头ip"
      },
      cameraPort: {
        required: true,
        message: "请输入摄像头端口"
      },
      mapPosition: {
        required: true,
        message: "请选择区域坐标"
      },
      lng: {
        required: true,
        message: "请选择经纬度"
      },
      cameraStatus: {
        required: true,
        message: "请输入1在线 0掉线"
      },
      cameraAble: {
        required: true,
        message: "请输入1启用 0禁用"
      },
      imgWidth: {
        required: true,
        message: "请输入抓拍人脸宽度"
      },
      imgHeight: {
        required: true,
        message: "请输入抓拍人脸高度"
      },
      bgImgWidth: {
        required: true,
        message: "请输入抓拍背景宽度"
      },
      bgImgHeight: {
        required: true,
        message: "请输入抓拍背景高度"
      }
    },
    labelTypeData: [],
    accessData: [],
    smsData: [],
    appData: [],
    mapRegionData: []
  }),
  methods: {
    async initData() {
      await getLabelType().then(res => {
        this.labelTypeData = res.data.rows;
      });
      await getAccess().then(res => {
        this.accessData = res.data.rows;
      });
      await getSms().then(res => {
        this.smsData = res.data.rows;
      });
      await getApp().then(response => {
        this.appData = response.data.rows;
      });
      await getCommunity().then(res => {
        if (res.status == 200) {
          this.mapRegionData = res.data.map;
        }
      });
    },
    // 获取表单详情
    getFormDetail() {
      this.$store.dispatch("camera/detail", this.id).then(res => {
        if (res.status == 200) {
          this.form = res.data;
          this.form.mlph = {
            id: this.form.mlphId,
            content: this.form.mlphName
          };

          if (res.data.callbackNums) {
            this.arrForm.callbackArr = res.data.callbackNums.split(",");
          }
          if (res.data.smsNums) {
            this.arrForm.smsArr = res.data.smsNums.split(",");
          }
          if (res.data.accessNums) {
            this.arrForm.accessArr = res.data.accessNums.split(",");
          }
          if (res.data.closedNums) {
            this.arrForm.closedArr = res.data.closedNums.split(",");
          }
          if (res.data.appNums) {
            this.arrForm.appArr = res.data.appNums.split(",");
          }
          if (res.data.voiceNums) {
            this.arrForm.voiceArr = res.data.voiceNums.split(",");
          }
        }
      });
    },
    // 上传照片
    onUpload(file) {
      let reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.addEventListener("load", () => {
        this.form.cameraImage = reader.result.substr(
          reader.result.indexOf(",") + 1
        );
      });
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
    // 选择门楼牌号
    selectMlph() {
      this.isMlphDialog = true;
      this.getMlphList();
    },
    onSubmit() {
      this.$refs.form.validate((valid, errArr) => {
        if (!valid) {
          if (
            !errArr.cameraCode &&
            !errArr.cameraName &&
            !errArr.cameraBrand &&
            !errArr.cameraIp &&
            !errArr.cameraPort &&
            !errArr.mapPosition &&
            !errArr.lng &&
            !errArr.cameraStatus &&
            !errArr.cameraAble
          ) {
            this.tabsValue = "second";
          }
          return;
        }

        let _form = Object.assign({}, this.form);
        // 格式化参数
        _form.mlphId = _form.mlph.id;
        _form.terminalId = this.terminalId;
        _form.callbackNums = this.arrForm.callbackArr.join(",");
        _form.accessNums = this.arrForm.accessArr.join(",");
        _form.closedNums = this.arrForm.closedArr.join(",");
        _form.smsNums = this.arrForm.smsArr.join(",");
        _form.appNums = this.arrForm.appArr.join(",");
        _form.voiceNums = this.arrForm.voiceArr.join(",");
        delete _form.mlph;

        // 判断修改或新增
        if (this.id) {
          // 修改信息
          this.$store.dispatch("camera/patch", _form).then(res => {
            let isSuccess = res.status === 200;
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "修改成功" : res.message,
              type: isSuccess ? "success" : "error",
              duration: 2000
            });
            if (isSuccess) {
              this.$emit("complete");
              this.isFormDialog = false;
            }
          });
        } else {
          // 新增信息
          this.$store.dispatch("camera/create", _form).then(res => {
            let isSuccess = res.status === 200;
            this.$notify({
              title: isSuccess ? "成功" : "失败",
              message: isSuccess ? "提交成功" : res.message,
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
    }
  }
};
</script>
<style lang="scss" scoped>
.camera-form {
  .m0 {
    margin: 0;
  }
  .el-input,
  .el-select {
    width: 100%;
  }
  .upload-show {
    display: inline-block;
    height: 36px;
    border-radius: 2px;
    vertical-align: top;
  }
  /deep/ {
    .el-tabs {
      height: calc(100vh - 320px);
    }
    .el-tabs__header {
      background: #fafbfd;
      height: 100%;
      margin-right: 0;
      border-right: 1px solid #e5e5e5;
    }
    .el-tabs__content {
      height: 100%;
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
    padding: 20px 20px 0 0;
  }

  .second-box {
    padding: 0 20px 20px 20px;
    img {
      display: block;
    }
    .heading {
      position: relative;
      line-height: 50px;
      font-size: 13px;
      font-weight: bold;
      color: #3f4041;
      &:before {
        position: absolute;
        left: 80px;
        right: 0;
        top: 24px;
        background: #eff1f4;
        height: 1px;
        content: "";
      }
    }
  }

  .third-box {
    padding: 0 20px 10px 32px;
    .heading {
      position: relative;
      line-height: 40px;
      margin-left: -18px;
      /deep/ .el-checkbox__label {
        padding-left: 6px;
        font-size: 13px;
        font-weight: bold;
        color: #3f4041;
      }
      .el-checkbox {
        background: #fff;
        padding-right: 20px;
        span {
          font-size: 12px;
          color: #f00;
        }
      }
      &:before {
        position: absolute;
        left: 0;
        right: -18px;
        top: 19px;
        background: #eff1f4;
        height: 1px;
        content: "";
      }
    }
    .child-box {
      padding-left: 20px;
      overflow: hidden;
    }
  }
}
</style>
