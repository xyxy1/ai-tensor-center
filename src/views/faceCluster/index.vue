<template>
    <div class="face-cluster">
        <div class="search-wrapper">
            <el-input v-model="keywords" placeholder="请输入关键字查询" style="width: 240px;"></el-input>&nbsp;&nbsp;
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </div>
        <el-row>
            <el-col :sm="4" :lg="3" v-for="(item, index) in data" :key="index">
                <el-card :body-style="{ padding: '0px' }">
                    <image-list-modal :id="item.identityNo">
                        <div class="image" :style="'background-image: url(' + item.identityImg + ')'"></div>
                    </image-list-modal>
                    <div style="padding: 14px;">
                        <span>{{item.identityNo}}</span>
                        <div class="bottom clearfix">
                            <time class="time">{{item.updTime}}</time>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <div class="block">
            <el-pagination
                layout="prev, pager, next"
                :current-page="page"
                :page-size="size"
                :total="total"
                @current-change="handlePageChange">
            </el-pagination>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import ImageListModal from "./components/ImageListModal";

export default {
  name: "faceCluster",
  data() {
      return {
          keywords: ''
      };
  },
  components: {
      'image-list-modal': ImageListModal
  },
  mounted() {
    this.$store.dispatch("cluster/fetchCluster", { page: this.page });
  },
  methods: {
    handlePageChange(page) {
        this.$store.dispatch("cluster/fetchCluster", { page });
    },
    handleSearch() {
        this.$store.dispatch("cluster/fetchCluster", { page: 1, identityNo: this.keywords });
    }
  },
  computed: {
    ...mapState({
      data: state => state.cluster.clusterData.data,
      page: state => state.cluster.clusterData.page,
      size: state => state.cluster.clusterData.size,
      total: state => state.cluster.clusterData.total
    })
  }
};
</script>

<style lang="scss" scoped>
.el-col {
    padding: 15px;
}

.search-wrapper {
    padding-top: 20px;
    padding-left: 30px;
}

.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  padding: 50% 0;
  background-size: cover;
  background-position: 50% 0;
  background-repeat: no-repeat;
  display: block;
  cursor: pointer;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.block {
    text-align: center;
}
</style>

