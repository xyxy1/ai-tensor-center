<template>
  <div class="app-wrapper">
    <nav-menu />
    <div class="main-container">
      <tags-view />
      <app-main />
    </div>
  </div>
</template>

<script>
export default {
  name: "layout",
  components: {
    NavMenu: () => import("./components/NavMenu"),
    TagsView: () => import("./components/TagsView"),
    AppMain: () => import("./components/AppMain")
  },
  created() {
    // 设置开启警报提醒
    this.$store.dispatch("SetAlarmSwitch", true);
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar;
    }
  }
};
</script>
