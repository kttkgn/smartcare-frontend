<template>
  <div class="faq-container">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="分类">
          <el-select
            v-model="searchForm.category"
            placeholder="选择分类"
            clearable
            class="custom-select"
            popper-class="custom-select-dropdown"
          >
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="select-option">
                <el-icon :class="getCategoryIcon(item.value)"></el-icon>
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入问题关键词"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            class="custom-select"
            popper-class="custom-select-dropdown"
          >
            <el-option label="已发布" value="published">
              <div class="select-option">
                <el-icon><Check /></el-icon>
                <span>已发布</span>
              </div>
            </el-option>
            <el-option label="草稿" value="draft">
              <div class="select-option">
                <el-icon><Document /></el-icon>
                <span>草稿</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- FAQ列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>FAQ列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增FAQ
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="faq-detail">
              <div class="detail-item">
                <span class="label">问题：</span>
                <span class="content">{{ row.question }}</span>
              </div>
              <div class="detail-item">
                <span class="label">回答：</span>
                <span class="content">{{ row.answer }}</span>
              </div>
              <div class="detail-item">
                <span class="label">标签：</span>
                <div class="tags">
                  <el-tag
                    v-for="tag in row.tags"
                    :key="tag"
                    size="small"
                    class="tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="question" label="问题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags.slice(0, 2)"
              :key="tag"
              size="small"
              class="tag"
            >
              {{ tag }}
            </el-tag>
            <el-tag
              v-if="row.tags.length > 2"
              size="small"
              type="info"
              class="tag"
            >
              +{{ row.tags.length - 2 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(row)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                size="small"
                type="success"
                @click="handlePublish(row)"
                v-if="row.status === 'draft'"
              >
                <el-icon><Check /></el-icon>
              </el-button>
              <el-button
                size="small"
                type="warning"
                @click="handleUnpublish(row)"
                v-if="row.status === 'published'"
              >
                <el-icon><Close /></el-icon>
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- FAQ表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增FAQ' : '编辑FAQ'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="问题" prop="question">
          <el-input
            v-model="form.question"
            type="textarea"
            :rows="2"
            placeholder="请输入问题"
          />
        </el-form-item>
        <el-form-item label="回答" prop="answer">
          <el-input
            v-model="form.answer"
            type="textarea"
            :rows="4"
            placeholder="请输入回答"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select
            v-model="form.category"
            placeholder="选择分类"
            class="custom-select"
            popper-class="custom-select-dropdown"
          >
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="select-option">
                <el-icon :class="getCategoryIcon(item.value)"></el-icon>
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入标签"
            class="custom-select"
            popper-class="custom-select-dropdown"
          >
            <el-option
              v-for="tag in tagOptions"
              :key="tag"
              :label="tag"
              :value="tag"
            >
              <div class="select-option">
                <el-icon><Collection /></el-icon>
                <span>{{ tag }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="published">发布</el-radio>
            <el-radio label="draft">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Check,
  Close,
  Document,
  Collection,
  Goods,
  User,
  Money,
  Service
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

// 分类选项
const categories = [
  { label: '产品使用', value: 'product' },
  { label: '账户管理', value: 'account' },
  { label: '支付问题', value: 'payment' },
  { label: '售后服务', value: 'service' }
]

// 标签选项
const tagOptions = [
  '常见问题',
  '新功能',
  '故障排除',
  '使用指南',
  '账户安全'
]

// 搜索表单
const searchForm = reactive({
  category: '',
  keyword: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    question: '如何修改账户密码？',
    answer: '您可以在账户设置中的安全选项里修改密码。',
    category: 'account',
    tags: ['账户安全', '密码修改'],
    status: 'published',
    created_at: '2024-03-20 10:00:00'
  },
  {
    id: 2,
    question: '如何查看订单状态？',
    answer: '您可以在订单管理页面查看所有订单的详细状态。',
    category: 'product',
    tags: ['订单管理', '使用指南'],
    status: 'draft',
    created_at: '2024-03-20 11:00:00'
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  question: '',
  answer: '',
  category: '',
  tags: [] as string[],
  status: 'draft'
})

// 表单验证规则
const rules = reactive<FormRules>({
  question: [
    { required: true, message: '请输入问题', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  answer: [
    { required: true, message: '请输入回答', trigger: 'blur' },
    { min: 10, max: 1000, message: '长度在 10 到 1000 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  tags: [
    { required: true, message: '请选择标签', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

// 获取分类标签类型
const getCategoryType = (category: string) => {
  const types: Record<string, string> = {
    product: 'primary',
    account: 'success',
    payment: 'warning',
    service: 'info'
  }
  return types[category] || 'info'
}

// 获取分类图标
const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    product: 'el-icon-goods',
    account: 'el-icon-user',
    payment: 'el-icon-money',
    service: 'el-icon-service'
  }
  return icons[category] || 'el-icon-folder'
}

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索逻辑
  console.log('搜索条件：', searchForm)
}

// 重置搜索
const handleReset = () => {
  searchForm.category = ''
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

// 新增FAQ
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.id = ''
  form.question = ''
  form.answer = ''
  form.category = ''
  form.tags = []
  form.status = 'draft'
}

// 编辑FAQ
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 发布FAQ
const handlePublish = (row: any) => {
  ElMessageBox.confirm(
    '确定要发布该FAQ吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    row.status = 'published'
    ElMessage.success('发布成功')
  }).catch(() => {
    // 取消操作
  })
}

// 取消发布
const handleUnpublish = (row: any) => {
  ElMessageBox.confirm(
    '确定要取消发布该FAQ吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    row.status = 'draft'
    ElMessage.success('已取消发布')
  }).catch(() => {
    // 取消操作
  })
}

// 删除FAQ
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '确定要删除该FAQ吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现删除逻辑
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消操作
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交逻辑
      console.log('表单数据：', form)
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功')
      dialogVisible.value = false
    }
  })
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}
</script>

<style scoped>
.faq-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-detail {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item .label {
  font-weight: bold;
  margin-right: 8px;
  color: #606266;
}

.detail-item .content {
  color: #303133;
}

.tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  margin-right: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table__expand-column .el-table__expand-icon) {
  color: #409eff;
}

:deep(.el-table__expanded-cell) {
  padding: 20px !important;
}

.custom-select {
  width: 200px;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-option .el-icon {
  font-size: 16px;
  color: #909399;
}

:deep(.custom-select-dropdown) {
  .el-select-dropdown__item {
    padding: 8px 12px;
    
    &.selected {
      color: #409eff;
      font-weight: bold;
      
      .el-icon {
        color: #409eff;
      }
    }
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
}

:deep(.el-select__tags) {
  margin: 4px 0;
}

:deep(.el-tag) {
  margin: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  .el-icon {
    margin-right: 0;
  }
}

:deep(.el-select-dropdown__item.selected) {
  color: #409eff;
  font-weight: bold;
}

:deep(.el-select-dropdown__item.hover) {
  background-color: #f5f7fa;
}
</style> 