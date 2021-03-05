/* 预置api，可自行更换

  UI组件：Element --- $message，.$confirm
  axios封装函数：$http
  参数处理：qs
  host地址：window.SITE_CONFIG['apiURL']，统一的请求地址
*/
import qs from 'qs'
// 本地变量，不需要mixin到组件逻辑中
const localOptions = {
  // mixin中的逻辑拷贝次数，适用于弹窗中也有类似于整体页面逻辑的情况， 如多个弹窗表单、多个弹窗分页。
  // 每一次拷贝后，所有变量与函数都会多一个索引后缀，类似_0, _1。
  // 该变量只能在此处↓ 修改才能生效。
  copyLogicCount: 0,
}

const data = {
  // 设置属性
  mxn_globalOptions: {
    createdIsNeed: true, // 此页面是否在创建时，调用查询数据列表接口？
    activatedIsNeed: false, // 使用keep-alive之后，此页面是否在激活（进入）时，调用查询数据列表接口？

    dataListIsPage: true, // 数据列表接口，是否需要分页？
    pagedListKey: 'records', // 分页时返回data列表数据的key

    operateId: 'id', // 操作id，编辑或者删除时通过该字段获取信息或执行操作。
    batchKey: 'ids', // 批量删除时需要的key值

    formRefName: 'form',
    editInfoFromRow: true, // 编辑时回显信息是否来自当前行信息，否则会请求详情数据

    openConsole: true, // 是否开启控制台打印请求结果
  },
  mxn_URL: {
    dataListURL: '', // 列表
    deleteURL: '', // 删除
    addURL: '', // 新增
    editURL: '', // 编辑
    detailInfoURL: '', // 详情
    exportURL: '', // 导出
  },
  // 页码信息
  mxn_pageInfo: {
    pageNum: 1, // 当前页码
    pageSize: 10, // 每页数
  },

  // 搜索栏条件信息
  mxn_searchInfo: {},

  // 新增或编辑表单信息
  mxn_dialogForm: {},

  // 检验规则
  mxn_rules: {},

  // 数据列表
  mxn_dataList: [],

  // 数据列表，多选数组
  mxn_dataListSelections: [],

  // 非手动修改配置，不需要在组件中修改
  mxn_needNotManualOptions: {
    dataListLoading: false, // 数据列表，loading状态
    dialogIsEdit: false, // 是否是编辑状态
    addOrEditVisible: false, // 新增／编辑，弹窗visible状态
    total: 0, // 数据总条数
    successCode: 200, // 响应成功状态码, 方法中使用非严格相等判断，也可以为字符串 '200'
  },
}

const methods = {
  mxn_beforeConfirm(dialogForm) {
    // dialogForm为当前表单对象
    // 在确认表单请求发送之前处理一些逻辑
  },
  mxn_inReset() {
    // 在重置表单时处理一些逻辑
  },
  mxn_afterGetList(dataList) {
    // dataList为当前数据列表数组
    // 在拿到列表数据之后处理一些逻辑
  },
  // 获取数据列表
  mxn_getDataList() {
    this.mxn_needNotManualOptions.dataListLoading = true
    this.$http
      .get(this.mxn_URL.dataListURL, {
        params: {
          ...this.mxn_pageInfo,
          ...this.mxn_searchInfo,
        },
      })
      .then((res) => {
        this.mxn_needNotManualOptions.dataListLoading = false
        if (this.mxn_globalOptions.openConsole)
          console.log('获取数据列表：', res)
        if (res.code != this.mxn_needNotManualOptions.successCode) {
          this.mxn_dataList = []
          this.mxn_needNotManualOptions.total = 0
          return this.$message.error(res.message)
        }

        this.mxn_dataList = this.mxn_globalOptions.dataListIsPage
          ? res.data[this.mxn_globalOptions.pagedListKey]
          : res.data
        this.mxn_needNotManualOptions.total = this.mxn_globalOptions
          .dataListIsPage
          ? parseInt(res.data.total)
          : 0
        this.mxn_afterGetList(this.mxn_dataList)
      })
      .catch((err) => {
        this.mxn_needNotManualOptions.dataListLoading = false
        console.log(err)
      })
  },
  // 处理每页条数改变
  mxn_pageSizeChange(size) {
    this.mxn_pageInfo.pageSize = size
    this.mxn_pageInfo.pageNum = 1
    this.mxn_getDataList()
  },
  // 处理页码改变
  mxn_pageNumChange(num) {
    this.mxn_pageInfo.pageNum = num
    this.mxn_getDataList()
  },
  // 显示新增或编辑弹窗
  mxn_showAddOrEditDialog(action, row) {
    this.mxn_needNotManualOptions.dialogIsEdit = action === 'edit'
    this.mxn_needNotManualOptions.addOrEditVisible = true

    if (!this.mxn_needNotManualOptions.dialogIsEdit) return

    if (this.mxn_globalOptions.editInfoFromRow) {
      this.mxn_dialogForm = JSON.parse(JSON.stringify(row))
    } else {
      this.mxn_getCurrRowDatail(row)
    }
  },
  // 获取该字段详细信息
  mxn_getCurrRowDatail(row) {
    const id = this.mxn_globalOptions.operateId
    this.$http
      .get(this.mxn_URL.detailInfoURL, {
        params: {
          [id]: row[id],
        },
      })
      .then((res) => {
        if (this.mxn_globalOptions.openConsole)
          console.log('获取该字段详细信息：', res)
        if (res.code != this.mxn_needNotManualOptions.successCode) {
          return this.$message.error(res.message)
        }
        this.mxn_dialogForm = res.data
      })
      .catch((err) => {
        console.log(err)
      })
  },
  // 确认新增或编辑弹窗
  mxn_confirmDialog() {
    const formDom = this.$refs[this.mxn_globalOptions.formRefName]
    if (!formDom)
      return this.$message.error(
        '请为需要提交的表单添加ref属性并将该ref值作为参数传入！'
      )

    formDom.validate((valid) => {
      if (!valid) return this.$message.error('请完善表单信息！')
      // 预处理确认逻辑
      this.mxn_beforeConfirm(this.mxn_dialogForm)
      const url = this.mxn_needNotManualOptions.dialogIsEdit
        ? this.mxn_URL.editURL
        : this.mxn_URL.addURL
      this.$http
        .post(url, this.mxn_dialogForm)
        .then((res) => {
          if (this.mxn_globalOptions.openConsole)
            console.log('确认新增或编辑：', res)

          if (res.code != this.mxn_needNotManualOptions.successCode) {
            return this.$message.error(res.message)
          }
          this.mxn_needNotManualOptions.addOrEditVisible = false
          this.mxn_getDataList()
          this.$message.success('操作成功！')
        })
        .catch((err) => {
          console.log(err)
        })
    })
  },

  // 多选表格项
  mxn_dataListSelectionChange(selectedval) {
    this.mxn_dataListSelections = selectedval
  },
  // 删除数据
  mxn_deleteData(row) {
    let ids = '',
      deleteKey = this.mxn_globalOptions.operateId
    if (!row[deleteKey] && this.mxn_dataListSelections.length <= 0) {
      return this.$message.info('未传入待删除的id值或id数组为空！')
    }

    if (!(this.mxn_dataListSelections.length > 0)) {
      ids = row[deleteKey]
    } else {
      ids = this.mxn_dataListSelections.map((item) => item[deleteKey]).join(',')
    }
    this.$confirm('确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        const params = {
          [this.mxn_globalOptions.batchKey]: ids,
        }

        this.$http
          .post(this.mxn_URL.deleteURL, params)
          .then((res) => {
            if (this.mxn_globalOptions.openConsole)
              console.log('删除数据：', res)

            if (res.code != this.mxn_needNotManualOptions.successCode) {
              return this.$message.error(res.message)
            }
            this.mxn_getDataList()
            this.$message.success('删除成功！')
          })
          .catch((err) => {
            console.log(err)
          })
      })
      .catch(() => {})
  },
  // 关闭新增或编辑弹窗
  mxn_closeDialog() {
    this.mxn_resetDialogForm()
    this.mxn_needNotManualOptions.addOrEditVisible = false
  },
  // 重置弹窗表单
  mxn_resetDialogForm() {
    const formDom = this.$refs[this.mxn_globalOptions.formRefName]
    if (!formDom)
      return this.$message.error(
        '请为需要重置的表单添加ref属性并将该ref值作为参数传入！'
      )
    formDom.resetFields()
    formDom.clearValidate()
    this.mxn_inReset()
  },
  // 重置搜索栏
  mxn_resetSearchInfo() {
    this.mxn_searchInfo = {}
    this.mxn_getDataList()
  },
  // 导出
  mxn_export() {
    const params = qs.stringify(this.mxn_searchInfo)
    window.location.href = `${window.SITE_CONFIG['apiURL']}${
      this.mxn_URL.exportURL
    }?${params}`
  },
}

// 拷贝data与methods，并同步替换methods中的变量名
const copyFunc = (target, type, count) => {
  const copyArr = []
  let map = {}
  for (let i = 0; i < count; i++) {
    if (type === 'data') {
      target = JSON.parse(JSON.stringify(target))
    }
    Object.keys(target).forEach((key) => {
      map[key + '_' + i] =
        type === 'data'
          ? target[key]
          : eval(`(${replaceVal(target[key].toString(), i)})`)
    })
    copyArr.push(map)
    map = {}
  }

  return copyArr
}

const replaceVal = (funcStr, i) => {
  // 匹配函数中调用的对象、变量、函数
  const reg = /\.mxn\_\w+/g
  return funcStr.replace(reg, (str) => {
    return str + '_' + i
  })
}
const copyDataRes = copyFunc(data, 'data', localOptions.copyLogicCount)
const copyMethodsRes = copyFunc(methods, 'methods', localOptions.copyLogicCount)

export default {
  data: () => Object.assign(data, ...copyDataRes),
  created() {
    if (this.mxn_globalOptions.createdIsNeed) this.mxn_getDataList()
  },
  activated() {
    if (this.mxn_globalOptions.activatedIsNeed) this.mxn_getDataList()
  },
  methods: Object.assign(methods, ...copyMethodsRes),
  // methods,
}
