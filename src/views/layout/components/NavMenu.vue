<template>
  <div class="menu-container">
    <div class="header-container">
      <picture-search size="small" ref="pictureSearch" placeholder="名称/证件号" async @complete="onSearchChange" />
      <el-button size="small" type="primary" icon="el-icon-search" @click="$refs.pictureSearch.searchAsync()">搜索</el-button>

      <div class="right">
        <a @click="$router.push('/myControl/alarmNews')">
          <el-badge :value="alarmTotal" :max="99" class="notice">
            <svg-icon icon-class="notice" />
          </el-badge>
        </a>
        <el-dropdown @command="onCommand" class="user">
          <div class="el-dropdown-link">
            <!-- <img-show width="36px" height="36px" txt="暂无头像" :img-src="userInfo.images"></img-show> -->
            <div class="box">
              <b>{{userInfo.username}}
                <i class="el-icon-caret-bottom"></i>
              </b>
              <p>{{userInfo.name}}</p>
            </div>
          </div>
          <el-dropdown-menu slot="dropdown" class="header-dropdown-menu">
            <el-dropdown-item command="password">修改密码</el-dropdown-item>
            <el-dropdown-item command="logout">安全退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="sidebar-container">
      <router-link to="/dashboard" class="logo">
        <img src="~@/assets/logo.png">
        <div class="place">
          <svg-icon icon-class="locale" />{{userInfo.departName}}
        </div>
      </router-link>

      <el-menu class="menu" :default-active="$route.path">
        <template v-for="item in userInfo.permissionMenus">
          <el-submenu :index="item.path" :key="item.name" v-if="item.children.length > 0">
            <template slot="title">
              <svg-icon v-if="item.icon" :icon-class="item.icon"></svg-icon>
              <span>{{item.title}}</span>
            </template>
            <template v-for="child in item.children">
              <el-menu-item :index="child.path" :key="child.name">
                <span>{{child.title}}</span>
                <router-link :to="child.path" class="url" :target="newPageFilter.includes(child.alias)?'_blank':''" />
              </el-menu-item>
            </template>
          </el-submenu>
          <el-menu-item v-else :index="item.path" :key="item.name">
            <svg-icon v-if="item.icon" :icon-class="item.icon"></svg-icon>
            <span>{{item.title}}</span>
            <router-link :to="item.path" class="url" :target="newPageFilter.includes(item.alias)?'_blank':''" />
          </el-menu-item>
        </template>
      </el-menu>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" :visible.sync="isPasswordDialog" width="400px">
      <el-form ref="formPassword" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="旧密码" prop="oldPass">
          <el-input v-model="form.oldPass" type="password" placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPass">
          <el-input v-model="form.newPass" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPass" class="m0">
          <el-input v-model="form.confirmPass" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="onSubmit">确定</el-button>
        <el-button size="mini" @click="isPasswordDialog = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { newPageFilter } from "@/utils/config";
import { putChangePassword } from "@/api/login";

export default {
  name: "NavMenu",
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入新密码"));
      } else if (value !== this.form.newPass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      newPageFilter: newPageFilter,

      isPasswordDialog: false,
      form: {
        oldPass: null,
        newPass: null,
        confirmPass: null
      },
      rules: {
        oldPass: [
          { required: true, message: "旧密码不能为空" },
          { min: 6, max: 20, message: "密码长度为6-20位" }
        ],
        newPass: [
          { required: true, message: "新密码不能为空" },
          { min: 6, max: 20, message: "密码长度为6-20位" }
        ],
        confirmPass: {
          required: true,
          validator: validatePass
        }
      }
    };
  },
  computed: {
    ...mapGetters(["userInfo", "alarmTotal"])
  },
  methods: {
    logout() {
      this.$store.dispatch("LogOut").then(() => {
        this.$router.push("/login");
      });
    },
    onCommand(command) {
      if (command === "logout") {
        this.logout();
      }
      if (command === "password") {
        this.isPasswordDialog = true;
        this.$nextTick(() => {
          this.$refs.formPassword && this.$refs.formPassword.resetFields();
        });
      }
    },
    onSubmit() {
      this.$refs.formPassword.validate(async valid => {
        if (!valid) return;

        // 修改密码
        putChangePassword(this.form).then(res => {
          let isSuccess = res.status === 200;
          // 提示处理
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "修改成功" : res.message,
            type: isSuccess ? "success" : "error",
            duration: 2000
          });

          if (isSuccess) {
            this.isPasswordDialog = false;
          }
        });
      });
    },
    onSearchChange(data) {
      this.$store.dispatch("allSearch/setData", data);
      this.$router.push("/searchAll");
    }
  }
};
</script>