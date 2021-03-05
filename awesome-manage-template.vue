<template>
  <div class="application-content">
    <!-- 搜索栏 -->
    <div class="application-head">
      <!-- <el-select
        class="input-all"
        v-model="mxn_searchInfo.ctD"
        style="width: 220px; margin-right: 10px"
      >
        <el-option
          v-for="item in clientOptions"
          :value="item.ctD"
          :key="item.ctD"
          :label="item.ctName"
        ></el-option>
      </el-select>

      <el-input
        class="input-query"
        style="width: 220px; margin-right: 10px"
        placeholder="输入模板编号或者名称查询"
        v-model="mxn_searchInfo.atNameOrCode"
      /> -->

      <el-button type="primary" icon="el-icon-search" @click="mxn_getDataList">
        搜索
      </el-button>
      <el-button
        type="success"
        @click="mxn_showAddOrEditDialog('add', {})"
        icon="el-icon-plus"
        >新建
      </el-button>
      <el-button
        type="danger"
        @click="mxn_deleteData({})"
        icon="el-icon-delete"
        v-show="mxn_dataListSelections.length > 0"
        >批量删除
      </el-button>
      <el-button
        type="danger"
        @click="mxn_resetSearchInfo"
        icon="el-icon-delete"
        >重置
      </el-button>
    </div>
    <!-- /搜索栏 -->
    <!-- 数据列表 -->
    <el-table
      :data="mxn_dataList"
      :border="true"
      @selection-change="mxn_dataListSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center">
      </el-table-column>
      <el-table-column label="序号" type="index" width="50" align="center" />

      <el-table-column prop label="操作" align="center">
        <template slot-scope="scope">
          <span @click="mxn_showAddOrEditDialog('edit', scope.row)">编辑</span>
          <span @click="mxn_deleteData(scope.row)">删除</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- /数据列表 -->
    <!-- 分页 -->
    <div class="pagination-block">
      <div class="block">
        <el-pagination
          background
          @size-change="mxn_pageSizeChange"
          @current-change="mxn_pageNumChange"
          :current-page="mxn_pageInfo.pageNum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="mxn_pageInfo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="mxn_needNotManualOptions.total"
        ></el-pagination>
      </div>
    </div>
    <!-- /分页 -->
    <!-- 表单弹窗 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="mxn_needNotManualOptions.dialogIsEdit ? '编辑' : '新增'"
      :visible.sync="mxn_needNotManualOptions.addOrEditVisible"
      width="60%"
      @close="mxn_closeDialog"
    >
      <el-form
        :model="mxn_dialogForm"
        :rules="mxn_rules"
        label-position="right"
        label-width="100px"
        :ref="mxn_globalOptions.formRefName"
        class="dialog-form"
      >
        <el-form-item label="模板名称" prop="atName">
          <el-input v-model="mxn_dialogForm.atName"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="mxn_closeDialog">取 消</el-button>
        <el-button type="primary" @click="mxn_confirmDialog"
          >确 定
        </el-button>
      </div>
    </el-dialog>
    <!-- /表单弹窗 -->
  </div>
</template>
<script>
import manageModule from "@/mixins/awesome-manage-module";

export default {
  name: "AwesomeManageTemplate",
  mixins: [manageModule],
  data() {
    return {};
  },
};
</script>
