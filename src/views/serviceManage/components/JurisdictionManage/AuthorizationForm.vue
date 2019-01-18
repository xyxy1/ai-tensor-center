<template>
  <el-dialog title="授权服务" :visible.sync="isAuthorizationVisible" class="authorization-form" width="500px">
    <el-form label-width="100px">
      <el-form-item label="允许访问服务">
        <el-select v-model="clients" multiple filterable remote placeholder="请输入服务关键词" :remote-method="remoteMethod" :loading="loading">
          <el-option v-for="item in items" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button size="mini" type="primary" @click="onSubmit">保 存</el-button>
      <el-button size="mini" @click="isAuthorizationVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { page, getClients, modifyClients } from "@/api/auth/service/index";
export default {
  props: {
    serviceId: Number,
    isOpen: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      items: [],
      clients: [],
      list: [],
      loading: false,
      isAuthorizationVisible: false
    };
  },
  watch: {
    isOpen(val) {
      this.isAuthorizationVisible = val;
    },
    isAuthorizationVisible(val) {
      if (val) {
        this.initClients();
      }
      this.$emit("update:isOpen", val);
    }
  },
  methods: {
    remoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        page({
          name: query
        }).then(response => {
          this.items = response.data.rows;
          this.total = response.data.total;
          this.loading = false;
        });
      } else {
        this.items = [];
      }
    },
    onSubmit() {
      const vals = {};
      if (this.clients.length > 0) vals.clients = this.clients.join();
      modifyClients(this.serviceId, vals).then(() => {
        this.$emit("closeClientDialog");
        this.$notify({
          title: "成功",
          message: "保存成功",
          type: "success",
          duration: 2000
        });
      });
    },
    initClients() {
      getClients(this.serviceId).then(response => {
        this.items = response.data;
        const leas = [];
        for (let i = 0; i < response.data.length; i++) {
          leas.push(response.data[i].id);
        }
        this.clients = leas;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.authorization-form {
  .el-select {
    width: 100%;
  }
  .el-form-item {
    margin: 0;
  }
}
</style>
