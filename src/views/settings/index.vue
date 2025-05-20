<template>
  <div class="settings">
    <el-tabs v-model="activeTab">
      <!-- 基本设置 -->
      <el-tab-pane label="基本设置" name="basic">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>基本设置</span>
              <el-button type="primary" @click="handleSaveBasic">保存设置</el-button>
            </div>
          </template>
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="120px"
          >
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="basicForm.systemName" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
                :before-upload="beforeLogoUpload"
              >
                <img v-if="basicForm.logo" :src="basicForm.logo" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="客服工作时间">
              <el-time-picker
                v-model="basicForm.workTime"
                is-range
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="HH:mm"
              />
            </el-form-item>
            <el-form-item label="自动回复">
              <el-switch v-model="basicForm.autoReply" />
            </el-form-item>
            <el-form-item
              v-if="basicForm.autoReply"
              label="自动回复内容"
              prop="autoReplyContent"
            >
              <el-input
                v-model="basicForm.autoReplyContent"
                type="textarea"
                :rows="4"
                placeholder="请输入自动回复内容"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 客服管理 -->
      <el-tab-pane label="客服管理" name="agents">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>客服管理</span>
              <el-button type="primary" @click="handleAddAgent">添加客服</el-button>
            </div>
          </template>
          <el-table
            :data="agents"
            border
            style="width: 100%"
          >
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="username" label="账号" width="120" />
            <el-table-column prop="email" label="邮箱" width="180" />
            <el-table-column prop="phone" label="手机号" width="120" />
            <el-table-column prop="role" label="角色" width="100">
              <template #default="{ row }">
                <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
                  {{ row.role === 'admin' ? '管理员' : '客服' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                  {{ row.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button-group>
                  <el-button size="small" @click="handleEditAgent(row)">编辑</el-button>
                  <el-button
                    size="small"
                    :type="row.status === 'active' ? 'danger' : 'success'"
                    @click="handleToggleAgent(row)"
                  >
                    {{ row.status === 'active' ? '禁用' : '启用' }}
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 权限设置 -->
      <el-tab-pane label="权限设置" name="permissions">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>权限设置</span>
              <el-button type="primary" @click="handleSavePermissions">保存设置</el-button>
            </div>
          </template>
          <el-form
            ref="permissionFormRef"
            :model="permissionForm"
            label-width="120px"
          >
            <el-form-item label="客服权限">
              <el-checkbox-group v-model="permissionForm.agentPermissions">
                <el-checkbox label="view_chat">查看会话</el-checkbox>
                <el-checkbox label="reply_chat">回复会话</el-checkbox>
                <el-checkbox label="transfer_chat">转接会话</el-checkbox>
                <el-checkbox label="close_chat">结束会话</el-checkbox>
                <el-checkbox label="view_faq">查看FAQ</el-checkbox>
                <el-checkbox label="edit_faq">编辑FAQ</el-checkbox>
                <el-checkbox label="view_analytics">查看统计</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="管理员权限">
              <el-checkbox-group v-model="permissionForm.adminPermissions">
                <el-checkbox label="manage_agents">管理客服</el-checkbox>
                <el-checkbox label="manage_faq">管理FAQ</el-checkbox>
                <el-checkbox label="manage_settings">系统设置</el-checkbox>
                <el-checkbox label="view_logs">查看日志</el-checkbox>
                <el-checkbox label="export_data">导出数据</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 客服表单对话框 -->
    <el-dialog
      v-model="agentDialogVisible"
      :title="agentDialogType === 'add' ? '添加客服' : '编辑客服'"
      width="500px"
    >
      <el-form
        ref="agentFormRef"
        :model="agentForm"
        :rules="agentRules"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="agentForm.name" />
        </el-form-item>
        <el-form-item label="账号" prop="username">
          <el-input v-model="agentForm.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="agentForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="agentForm.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="agentForm.role">
            <el-option label="管理员" value="admin" />
            <el-option label="客服" value="agent" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="agentDialogType === 'add'"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="agentForm.password"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="agentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitAgent">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 当前激活的标签页
const activeTab = ref('basic')

// 基本设置表单
const basicFormRef = ref<FormInstance>()
const basicForm = reactive({
  systemName: '智能客服系统',
  logo: '',
  workTime: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 18, 0)],
  autoReply: false,
  autoReplyContent: ''
})

const basicRules = reactive<FormRules>({
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  autoReplyContent: [
    { required: true, message: '请输入自动回复内容', trigger: 'blur' }
  ]
})

// 客服列表
const agents = ref([
  {
    id: 1,
    name: '客服小王',
    username: 'agent1',
    email: 'agent1@example.com',
    phone: '13800138001',
    role: 'admin',
    status: 'active'
  },
  {
    id: 2,
    name: '客服小李',
    username: 'agent2',
    email: 'agent2@example.com',
    phone: '13800138002',
    role: 'agent',
    status: 'active'
  },
  {
    id: 3,
    name: '客服小张',
    username: 'agent3',
    email: 'agent3@example.com',
    phone: '13800138003',
    role: 'agent',
    status: 'inactive'
  }
])

// 客服表单对话框
const agentDialogVisible = ref(false)
const agentDialogType = ref<'add' | 'edit'>('add')
const agentFormRef = ref<FormInstance>()
const agentForm = reactive({
  id: '',
  name: '',
  username: '',
  email: '',
  phone: '',
  role: 'agent',
  password: ''
})

const agentRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
})

// 权限设置表单
const permissionFormRef = ref<FormInstance>()
const permissionForm = reactive({
  agentPermissions: ['view_chat', 'reply_chat', 'transfer_chat', 'close_chat', 'view_faq'],
  adminPermissions: ['manage_agents', 'manage_faq', 'manage_settings', 'view_logs', 'export_data']
})

// Logo上传
const handleLogoSuccess = (response: any) => {
  basicForm.logo = response.url
}

const beforeLogoUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传Logo只能是图片格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传Logo图片大小不能超过 2MB!')
  }
  return isImage && isLt2M
}

// 保存基本设置
const handleSaveBasic = async () => {
  if (!basicFormRef.value) return
  await basicFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现保存逻辑
      console.log('基本设置：', basicForm)
      ElMessage.success('保存成功')
    }
  })
}

// 添加客服
const handleAddAgent = () => {
  agentDialogType.value = 'add'
  agentDialogVisible.value = true
  agentForm.id = ''
  agentForm.name = ''
  agentForm.username = ''
  agentForm.email = ''
  agentForm.phone = ''
  agentForm.role = 'agent'
  agentForm.password = ''
}

// 编辑客服
const handleEditAgent = (row: any) => {
  agentDialogType.value = 'edit'
  agentDialogVisible.value = true
  Object.assign(agentForm, row)
}

// 切换客服状态
const handleToggleAgent = (row: any) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  ElMessageBox.confirm(
    `确定要${newStatus === 'active' ? '启用' : '禁用'}该客服吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    row.status = newStatus
    ElMessage.success(`${newStatus === 'active' ? '启用' : '禁用'}成功`)
  }).catch(() => {
    // 取消操作
  })
}

// 提交客服表单
const handleSubmitAgent = async () => {
  if (!agentFormRef.value) return
  await agentFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交逻辑
      console.log('客服信息：', agentForm)
      ElMessage.success(agentDialogType.value === 'add' ? '添加成功' : '编辑成功')
      agentDialogVisible.value = false
    }
  })
}

// 保存权限设置
const handleSavePermissions = () => {
  // TODO: 实现保存逻辑
  console.log('权限设置：', permissionForm)
  ElMessage.success('保存成功')
}
</script>

<style scoped>
.settings {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-uploader {
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style> 