<template>
  <div class="city-picker">
    <el-select clearable :value="parseProvince" placeholder="省" :loading="provinceLoading" @change="changeProvince">
      <el-option v-for="item in provinces" :key="item.provinceCode" :label="item.provinceName" :value="item.provinceCode">
      </el-option>
    </el-select>
    <el-select clearable :value="parseCity" placeholder="市" :loading="cityLoading" @change="changeCity">
      <el-option v-for="item in cities" :key="item.cityCode" :label="item.cityName" :value="item.cityCode">
      </el-option>
    </el-select>
    <el-select clearable :value="parseDistrict" placeholder="区县" :loading="districtLoading" @change="changeDistrict">
      <el-option v-for="item in districts" :key="item.districtCode" :label="item.districtName" :value="item.districtCode">
      </el-option>
    </el-select>
  </div>
</template>

<script>
  import {fetchProvinces, fetchCities, fetchDistricts} from '@/api/common'

  export default {
    model: {
//      prop: 'modelVal',
      event: 'change'
    },
    props: {
      value: {
        required: false
      }
    },
    created() {
      this.getProvinces()
    },
    data() {
      return {
        provinces: [],
        provinceLoading: true,
        cities: [],
        cityLoading: true,
        districts: [],
        districtLoading: true,
      }
    },
    computed: {
      parseProvince() {
        if (this.value) {
          if (this.value.province) {
            this.changeProvince(this.value.province)
          }
          return this.value.province
        }
      },
      parseCity() {
        if (this.value) {
          if (this.value.city) {
            this.changeCity(this.value.city)
          }
          return this.value.city
        }
      },
      parseDistrict() {
        if (this.value) {
          return this.value.district
        }
      },
    },
    methods: {
      getProvinces() {
        this.provinceLoading = true
        fetchProvinces().then(data => {
          this.provinces = data
          this.provinceLoading = false
        })
      },
      changeProvince(provinceCode) {
        this.value.province = provinceCode
        this.cityLoading = true
        fetchCities(provinceCode).then(data => {
          this.cities = data
          this.cityLoading = false
        })
      },
      changeCity(cityCode) {
        this.value.city = cityCode
        this.districtLoading = true
        fetchDistricts(cityCode).then(data => {
          this.districts = data
          this.districtLoading = false
        })
      },
      changeDistrict(districtCode) {
        this.value.district = districtCode
        this.$emit('change', this.value)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .city-picker .el-input {
    width: 150px;
  }
</style>
