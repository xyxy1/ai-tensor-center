<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-button-group>
        <el-button type="primary" v-if="aiResourceManager_btn_add" icon="plus" @click="handlerAdd">添加</el-button>
        <el-button type="primary" v-if="aiResourceManager_btn_edit" icon="edit" @click="handlerEdit">编辑</el-button>
        <el-button type="primary" v-if="aiResourceManager_btn_del" icon="delete" @click="handleDelete">删除</el-button>
      </el-button-group>
    </div>

    <el-row>
      <el-col :span="7" style='margin-top:15px;margin-right:10px'>
        <el-card class="box-card">
          <el-input
            placeholder="输入关键字进行过滤"
            v-model="filterText">
          </el-input>
          <el-tree
            class="filter-tree"
            :data="treeData"
            node-key="id"
            highlight-current
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="resourceTree"
            @node-click="getNodeData"
            default-expand-all
          >
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="16" style='margin-top:15px;'>
        <el-card class="box-card">
          <el-form :label-position="labelPosition" label-width="80px" :model="form" ref="form">
            <el-form-item label="编码" prop="code">
              <el-input v-model="form.code" :disabled="formEdit" placeholder="请输入编码"></el-input>
            </el-form-item>
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" :disabled="formEdit" placeholder="请输入标题"></el-input>
            </el-form-item>
            <el-form-item label="类型" prop="type">
              <el-select class="filter-item" v-model="form.type" :disabled="formEdit" placeholder="请输入资源请求类型">
                <el-option v-for="item in typeOptions" :key="item.id" :label="item.labelDefault"
                           :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="省市县：" class="is-required">
              <areaCombo :province="form.provinceCode"
                         :city="form.cityCode"
                         :district="form.countyCode"
                         @provinceChange="form.provinceCode = arguments[0]"
                         @cityChange="form.cityCode = arguments[0]"
                         @districtChange="form.countyCode = arguments[0]"/>
            </el-form-item>
            <el-form-item label="详细地址" prop="address">
              <el-input v-model="form.address" :disabled="formEdit" placeholder="请输入详细地址"></el-input>
            </el-form-item>
            <el-form-item label="经纬度" prop="longitude">
              <baiduMap   :lng="form.longitude"
                          :lat="form.latitude"
                          @transferLng="form.longitude = arguments[0]"
                          @transferLat="form.latitude = arguments[0]"/>
            </el-form-item>
            <el-form-item label="负责人" prop="contact">
              <el-input v-model="form.contact" :disabled="formEdit" placeholder="请输入负责人"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="tel">
              <el-input v-model="form.tel" :disabled="formEdit" placeholder="请输入联系电话"></el-input>
            </el-form-item>
            <el-form-item label="传真" prop="fax">
              <el-input v-model="form.fax" :disabled="formEdit" placeholder="请输入传真"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" :disabled="formEdit" placeholder="请输入邮箱"></el-input>
            </el-form-item>
            <el-form-item v-if="formStatus == 'update'">
              <el-button type="primary" @click="update">更新</el-button>
              <el-button @click="onCancel">取消</el-button>
            </el-form-item>
            <el-form-item v-if="formStatus == 'create'">
              <el-button type="primary" @click="create">保存</el-button>
              <el-button @click="onCancel">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {
    fetchTree, getObj, addObj, delObj, putObj
  } from '@/api/ai/resource/index';
  import {mapGetters} from 'vuex';
  import {getDictValueType} from '@/api/dict/dictValue/index';
  export default {
    data() {
      return {
        filterText: '',
        list: null,
        total: null,
        formEdit: true,
        formAdd: true,
        formStatus: '',
        showElement: false,
        typeOptions: [],
        provinceOptions: [],
        cityOptions: [],
        countyOptions: [],
        listQuery: {
          name: undefined
        },
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        labelPosition: 'right',
        form: {
          id: undefined,
          code: undefined,
          name: undefined,
          type: undefined,
          longitude: undefined,
          latitude: undefined,
          provinceCode: undefined,
          cityCode: undefined,
          countyCode: undefined,
          address: undefined,
          contact: undefined,
          tel: undefined,
          fax: undefined,
          desc: undefined,
          email: undefined,
          floor: undefined,
          purpose: undefined,
          parentId: undefined,
          parentIds: undefined,
          crtUser: undefined,
          crtName: undefined,
          crtTime: undefined,
          updUser: undefined,
          updName: undefined,
          updTime: undefined,
          attr1: undefined,
          attr2: undefined,
          attr3: undefined,
          attr4: undefined,
          attr5: undefined,
          attr6: undefined,
          attr7: undefined,
          attr8: undefined,
          attr9: undefined
        },
        currentId: -1,
        aiResourceManager_btn_add: false,
        aiResourceManager_btn_edit: false,
        aiResourceManager_btn_del: false
      }
    },
    watch: {
      filterText(val) {
        this.$refs.resourceTree.filter(val);
      }
    },
    created() {
      this.getList();
      this.aiResourceManager_btn_add = this.elements['aiResourceManager:btn_add'];
      this.aiResourceManager_btn_del = this.elements['aiResourceManager:btn_del'];
      this.aiResourceManager_btn_edit = this.elements['aiResourceManager:btn_edit'];
      getDictValueType('ai_resourceType').then(response => {
        this.typeOptions = response.data.rows;
      });
    },
    computed: {
      ...mapGetters([
        'elements'
      ])
    },
    methods: {
      getList() {
        fetchTree(this.listQuery).then(data => {
          this.treeData = data;
        });
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      getNodeData(data) {
        if (!this.formEdit) {
          this.formStatus = 'update';
        }
        getObj(data.id).then(response => {
          this.form = response.data;
        });
        this.currentId = data.id;
        this.showElement = true;
      },
      handlerEdit() {
        if (this.form.id) {
          this.formEdit = false;
          this.formStatus = 'update';
        }
      },
      handlerAdd() {
        this.resetForm();
        this.formEdit = false;
        this.formStatus = 'create';
      },
      handleDelete() {
        this.$confirm('此操作将永久删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delObj(this.currentId).then(() => {
            this.getList();
            this.resetForm();
            this.onCancel();
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            });
          });
        });
      },
      update() {
        putObj(this.form.id, this.form).then(() => {
          this.getList();
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          });
        });
      },
      create() {
        addObj(this.form).then(() => {
          this.getList();
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          });
        });
      },
      onCancel() {
        this.formEdit = true;
        this.formStatus = '';
      },
      resetForm() {
        this.form = {
          id: undefined,
          code: undefined,
          name: undefined,
          type: undefined,
          longitude: undefined,
          latitude: undefined,
          provinceCode: undefined,
          cityCode: undefined,
          countyCode: undefined,
          address: undefined,
          contact: undefined,
          tel: undefined,
          fax: undefined,
          desc: undefined,
          email: undefined,
          floor: undefined,
          purpose: undefined,
          parentId: this.currentId,
          parentIds: undefined,
          crtUser: undefined,
          crtName: undefined,
          crtTime: undefined,
          updUser: undefined,
          updName: undefined,
          updTime: undefined,
          attr1: undefined,
          attr2: undefined,
          attr3: undefined,
          attr4: undefined,
          attr5: undefined,
          attr6: undefined,
          attr7: undefined,
          attr8: undefined,
          attr9: undefined
        };
      }
    }
  }
</script>


