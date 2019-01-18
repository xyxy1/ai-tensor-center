<template>
  <div class="app-container calendar-list-container">
    <el-row>
      <el-col :span="8">
        <div class="grid-content bg-purple" style="margin-right: 10px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>织架构</span>
            </div>
            <div>
              <el-input placeholder="输入关键字进行过滤" v-model="filterText">
              </el-input>
              <el-tree class="filter-tree" node-key="id" :data="mainTreeData" :props="defaultProps"
                       :expand-on-click-node="false"
                       :filter-node-method="filterNode" ref="mainTree" @node-click="getTreeNodeData" highlight-current>
              </el-tree>
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :span="16" style="height:100%">
        <div class="grid-content bg-purple-light">
          <el-card class="box-card" style="height:100%">
            <div>
              <el-tab-pane label="终端设备管理" name="first">
                <div class="filter-container">
                  <el-input @keyup.enter.native="handlerTableRowFilter" style="width: 200px;" class="filter-item"
                            placeholder="标签或code" v-model="listTableQuery.name">
                  </el-input>
                  <el-button class="filter-item" type="primary" icon="search" @click="handlerTableRowFilter">搜索
                  </el-button>
                  <el-button class="filter-item" style="margin-left: 10px;" @click="handleTableRowCreate"
                             v-if="terminalManager_btn_add" type="primary">添加设备
                  </el-button>
                </div>
                <el-table :data="childTableData" border highlight-current-row style="width: 100%">
                  <el-table-column width="200" align="center" label="姓名">
                    <template slot-scope="scope">
                      <span>{{scope.row.name}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column width="110" align="center" label="账户">
                    <template slot-scope="scope">
                      <span>{{scope.row.Terminalname}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column width="110" align="center" label="性别">
                    <template slot-scope="scope">
                      <span>{{scope.row.sex}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column width="300" align="center" label="备注">
                    <template slot-scope="scope">
                      <span>{{scope.row.description}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column fixed="right" label="操作" width="150px">
                    <template slot-scope="scope">
                      <el-button size="small" type="text" @click="handleTableRowDelete(scope.row)" style="color: red"
                                 v-if="terminalManager_btn_Terminal_del">
                        <i class="el-icon-delete"></i>
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
    <el-dialog v-if="terminalManager_btn_add" title="添加设备" :visible.sync="dialogTerminalVisible">

    </el-dialog>
  </div>
</template>

<script>
  import {
    addObj,
    delObj,
    getObj,
    putObj
  } from '@/api/ai/terminal/index';
  import {mapGetters} from 'vuex';
  import {getDictValueType} from '@/api/dict/dictValue/index';
  import {
    fetchTree
  } from '@/api/ai/resource/index';

  export default {
    components: {
    },
    watch: {
      filterText(val) {
        this.$refs.mainTree.filter(val);
      }
    },
    methods: {
      filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      handleTableRowCreate() {
        if (this.currentTreeNodeId === undefined) {
          this.$notify({
            title: '提示',
            message: '请先选择部门节点！',
            type: 'warning',
            duration: 2000
          });
        } else {
          this.dialogTerminalVisible = true
        }
      },
      handleTableRowDelete(row) {
        this.$confirm('此操作将永久删除用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delObj({departId: this.currentTreeNodeId, TerminalId: row.id}).then(() => {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            });
            const index = this.childTableData.indexOf(row);
            this.childTableData.splice(index, 1);
          });
        });
      },
      handlerTableRowFilter() {
        this.listTableQuery.departId = this.currentTreeNodeId
        const query = {
          departId: this.currentTreeNodeId,
          name: this.listTableQuery.name
        };
        getTerminals(query).then(response => {
          this.childTableData = response.data.rows;
        });
      },
      initmainTreeData() {
        fetchTree().then(data => {
          this.mainTreeData = data
        });
      },
      getTreeNodeData(data) {
        this.currentTreeNodeId = data.id
        this.currentTreeNode = data
        const query = {
          departId: this.currentTreeNodeId
        };
        getObj(query).then(response => {
          this.childTableData = response.data.rows
        });
        this.$refs.positionManager.getList(data.id)
      },
      closeTerminalDialog(selects) {
        this.dialogTerminalVisible = false
        const uIds = []
        let flag = false
        for (let i = 0; i < selects.length; i++) {
          flag = true
          for (let j = 0; j < this.childTableData.length; j++) {
            if (this.childTableData[j].id === selects[i].id) {
              flag = false
            }
          }
          if (flag) {
            this.childTableData.push(selects[i])
            uIds.push(selects[i].id)
          }
        }
        
        this.$refs.departTerminal.clear()
        addObj({departId: this.currentTreeNodeId, TerminalIds: uIds.join()}).then(() => {
          this.$notify({
            title: '成功',
            message: '保存成功',
            type: 'success',
            duration: 2000
          });
        });
      }
    },
    created() {
      this.initmainTreeData()
      // 加载树
      this.terminalManager_btn_edit = this.elements['terminalManager:btn_edit'];
      this.terminalManager_btn_del = this.elements['terminalManager:btn_del'];
      this.terminalManager_btn_add = this.elements['terminalManager:btn_add'];
      getDictValueType('org_depart').then(response => {
        this.departTypeOptions = response.data.rows;
      });
    },
    computed: {
      ...mapGetters(['elements'])
    },
    data() {
      return {
        dialogTerminalVisible: false,
        departTypeOptions: [],
        terminalManager_btn_edit: false,
        terminalManager_btn_del: false,
        terminalManager_btn_add: false,
        filterText: '',
        editTreeFormFlag: false,
        currentTreeNodeId: undefined,
        currentTreeNode: {},
        listTableQuery: {
          name: undefined,
          departId: undefined
        },
        mainTreeData: [],
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        childTableData: []
      };
    }
  };
</script>
