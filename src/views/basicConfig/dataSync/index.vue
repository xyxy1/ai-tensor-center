<template>
  <div class="data-sync">
    <el-select v-model="communityCode">
      <el-option v-for="item in communityData" :key="item.communityId" :value="item.communityCode" :label="item.communityName"></el-option>
    </el-select>
    <el-button type="primary" plain @click="onDataUpload">数据同步到01</el-button>
  </div>
</template>
<script>
import { getCommunityPush } from "@/api/basicConfig/dataSync";
import { getCommunityList } from "@/api/bigData/camera";
export default {
  data() {
    return {
      communityData: [],
      communityCode: null
    };
  },
  created() {
    this.getCommunityData();
  },
  methods: {
    getCommunityData() {
      getCommunityList().then(res => {
        this.communityData = res.data.filter(item => item.appFlag != 0);
      });
    },
    // 数据上传到中心
    onDataUpload() {
      if (!this.communityCode) {
        this.$notify({
          title: "提示",
          message: "请选择小区",
          type: "warning",
          duration: 2000
        });
        return;
      }

      getCommunityPush({ communityCode: this.communityCode }).then(res => {
        let isSuccess = res.status === 200;
        // 提示处理
        this.$notify({
          title: isSuccess ? "成功" : "失败",
          message: isSuccess ? "数据同步成功" : res.message,
          type: isSuccess ? "success" : "error",
          duration: 2000
        });
      });
    }
  }
};
</script>
<style>
.data-sync {
  padding: 20px;
}
</style>