<template>
  <el-select :size="size" v-model="currentValue" @change="update" :placeholder="placeholder" :clearable="clearable">
    <el-option v-for="item in typeList" :key="item.id" :label="item.labelDefault" :value="item.value.toString()"></el-option>
  </el-select>
</template>
<script>
import { getDictValueType } from "@/api/dict/dictValue";

export default {
  model: {
    //      prop: 'modelVal',
    event: "change"
  },
  props: {
    value: {
      type: [String, Number]
    },
    dictName: {
      required: true,
      type: [String, Number]
    },
    placeholder: String,
    size: String,
    clearable: Boolean
  },
  watch: {
    value(newVal) {
      this.currentValue = newVal && newVal.toString();
    },
    currentValue(newVal) {
      this.$emit("input", newVal);
    },
    dictName() {
      this.getDictValueType();
    }
  },
  data() {
    return {
      currentValue: this.value ? this.value : null,
      typeList: []
    };
  },
  created() {
    this.getDictValueType();
  },
  methods: {
    getDictValueType() {
      getDictValueType(this.dictName).then(resp => {
        this.typeList = resp.data.rows;
      });
    },
    update(val) {
      this.$emit("change", val);
    }
  }
};
</script>
<style lang="scss" scoped></style>
