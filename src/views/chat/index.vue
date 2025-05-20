<template>
  <div class="chat-manage">
    <el-row :gutter="20">
      <!-- 会话列表 -->
      <el-col :span="8">
        <el-card class="session-list">
          <template #header>
            <div class="card-header">
              <span>会话列表</span>
              <el-button type="primary" size="small" @click="showNewSessionDialog">
                <el-icon><Plus /></el-icon>新建会话
              </el-button>
            </div>
          </template>

          <!-- 搜索框 -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索会话"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- 会话列表 -->
          <div class="session-items">
            <div
              v-for="session in filteredSessions"
              :key="session.id"
              class="session-item"
              :class="{ active: currentSession?.id === session.id }"
              @click="handleSelectSession(session)"
            >
              <div class="session-info">
                <div class="user-info">
                  <el-avatar :size="40" :src="session.user_avatar" />
                  <div class="user-details">
                    <div class="username">{{ session.user_name }}</div>
                    <div class="last-message">{{ session.last_message }}</div>
                  </div>
                </div>
                <div class="session-meta">
                  <div class="time">{{ formatTime(session.last_message_at) }}</div>
                  <el-tag
                    :type="session.status === 'active' ? 'success' : 'info'"
                    size="small"
                  >
                    {{ session.status === 'active' ? '进行中' : '已结束' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 聊天区域 -->
      <el-col :span="16">
        <el-card v-if="currentSession" class="chat-area">
          <template #header>
            <div class="chat-header">
              <div class="user-info">
                <el-avatar :size="40" :src="currentSession.user_avatar" />
                <div class="user-details">
                  <div class="username">{{ currentSession.user_name }}</div>
                  <div class="status">
                    {{ currentSession.status === 'active' ? '在线' : '离线' }}
                  </div>
                </div>
              </div>
              <div class="actions">
                <el-button-group>
                  <el-button
                    :type="currentSession.status === 'active' ? 'danger' : 'success'"
                    @click="handleToggleSession"
                  >
                    {{ currentSession.status === 'active' ? '结束会话' : '重新开始' }}
                  </el-button>
                  <el-button type="primary" @click="handleTransfer">
                    转接会话
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>

          <!-- 消息列表 -->
          <div class="message-list" ref="messageList">
            <div
              v-for="message in currentSession.messages"
              :key="message.id"
              class="message-item"
              :class="{ 'message-self': message.sender_type === 'agent' }"
            >
              <el-avatar
                :size="36"
                :src="message.sender_type === 'agent' ? agentAvatar : currentSession.user_avatar"
              />
              <div class="message-content">
                <div class="message-info">
                  <span class="sender">{{ message.sender_name }}</span>
                  <span class="time">{{ formatTime(message.created_at) }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-area">
            <el-input
              v-model="messageInput"
              type="textarea"
              :rows="3"
              placeholder="输入消息..."
              @keyup.enter.ctrl="handleSendMessage"
            />
            <div class="input-actions">
              <el-button type="primary" @click="handleSendMessage">
                发送消息 (Ctrl + Enter)
              </el-button>
            </div>
          </div>
        </el-card>

        <el-empty
          v-else
          description="请选择一个会话或创建新会话"
        />
      </el-col>
    </el-row>

    <!-- 转接会话对话框 -->
    <el-dialog
      v-model="transferDialogVisible"
      title="转接会话"
      width="400px"
    >
      <el-form :model="transferForm" label-width="80px">
        <el-form-item label="选择客服">
          <el-select v-model="transferForm.agent_id" placeholder="请选择客服">
            <el-option
              v-for="agent in availableAgents"
              :key="agent.id"
              :label="agent.name"
              :value="agent.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="转接原因">
          <el-input
            v-model="transferForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入转接原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="transferDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleTransferSubmit">
            确认转接
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新建会话对话框 -->
    <el-dialog
      v-model="newSessionDialogVisible"
      title="新建会话"
      width="500px"
    >
      <el-form :model="newSessionForm" :rules="newSessionRules" ref="newSessionFormRef" label-width="100px">
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="newSessionForm.userType" placeholder="请选择用户类型">
            <el-option label="新用户" value="new" />
            <el-option label="老用户" value="existing" />
          </el-select>
        </el-form-item>
        
        <template v-if="newSessionForm.userType === 'existing'">
          <el-form-item label="选择用户" prop="userId">
            <el-select
              v-model="newSessionForm.userId"
              filterable
              remote
              :remote-method="searchUsers"
              placeholder="请输入用户名或ID搜索"
              :loading="userSearchLoading"
            >
              <el-option
                v-for="user in searchUserResults"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              >
                <div class="user-option">
                  <el-avatar :size="24" :src="user.avatar" />
                  <span>{{ user.name }}</span>
                  <span class="user-id">ID: {{ user.id }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="用户信息" prop="userInfo">
            <el-input
              v-model="newSessionForm.userInfo"
              type="textarea"
              :rows="3"
              placeholder="请输入用户基本信息（姓名、联系方式等）"
            />
          </el-form-item>
        </template>

        <el-form-item label="会话类型" prop="sessionType">
          <el-select v-model="newSessionForm.sessionType" placeholder="请选择会话类型">
            <el-option label="产品咨询" value="product" />
            <el-option label="技术支持" value="technical" />
            <el-option label="账户问题" value="account" />
            <el-option label="售后服务" value="after-sales" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="初始消息" prop="initialMessage">
          <el-input
            v-model="newSessionForm.initialMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入初始消息内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="newSessionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreateSession">创建会话</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

// 搜索关键词
const searchKeyword = ref('')

// 当前会话
const currentSession = ref<any>(null)

// 消息列表引用
const messageList = ref<HTMLElement>()

// 消息输入
const messageInput = ref('')

// 转接会话对话框
const transferDialogVisible = ref(false)
const transferForm = ref({
  agent_id: '',
  reason: ''
})

// 新建会话相关
const newSessionDialogVisible = ref(false)
const newSessionFormRef = ref<FormInstance>()
const userSearchLoading = ref(false)
const searchUserResults = ref([])

const newSessionForm = ref({
  userType: 'new',
  userId: '',
  userInfo: '',
  sessionType: '',
  initialMessage: ''
})

const newSessionRules = {
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  userInfo: [{ required: true, message: '请输入用户信息', trigger: 'blur' }],
  sessionType: [{ required: true, message: '请选择会话类型', trigger: 'change' }],
  initialMessage: [{ required: true, message: '请输入初始消息', trigger: 'blur' }]
}

// 模拟数据
const sessions = ref([
  {
    id: 1,
    user_id: 1,
    user_name: '张三',
    user_avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    status: 'active',
    last_message: '您好，我想咨询一个问题',
    last_message_at: new Date().toISOString(),
    messages: [
      {
        id: 1,
        sender_type: 'user',
        sender_name: '张三',
        content: '您好，我想咨询一个问题',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        sender_type: 'agent',
        sender_name: '客服小王',
        content: '您好，请问有什么可以帮您？',
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 2,
    user_id: 2,
    user_name: '李四',
    user_avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    status: 'inactive',
    last_message: '谢谢，问题已经解决了',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      {
        id: 1,
        sender_type: 'user',
        sender_name: '李四',
        content: '我的订单什么时候发货？',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        sender_type: 'agent',
        sender_name: '客服小王',
        content: '您的订单将在今天下午发货',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        sender_type: 'user',
        sender_name: '李四',
        content: '谢谢，问题已经解决了',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  }
])

// 可用客服列表
const availableAgents = ref([
  { id: 1, name: '客服小王' },
  { id: 2, name: '客服小李' },
  { id: 3, name: '客服小张' }
])

// 客服头像
const agentAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

// 过滤后的会话列表
const filteredSessions = computed(() => {
  if (!searchKeyword.value) return sessions.value
  const keyword = searchKeyword.value.toLowerCase()
  return sessions.value.filter(session =>
    session.user_name.toLowerCase().includes(keyword) ||
    session.last_message.toLowerCase().includes(keyword)
  )
})

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString()
}

// 选择会话
const handleSelectSession = (session: any) => {
  currentSession.value = session
  nextTick(() => {
    scrollToBottom()
  })
}

// 新建会话
const showNewSessionDialog = () => {
  newSessionDialogVisible.value = true
  newSessionForm.value = {
    userType: 'new',
    userId: '',
    userInfo: '',
    sessionType: '',
    initialMessage: ''
  }
}

// 切换会话状态
const handleToggleSession = () => {
  if (!currentSession.value) return
  
  const newStatus = currentSession.value.status === 'active' ? 'inactive' : 'active'
  ElMessageBox.confirm(
    `确定要${newStatus === 'active' ? '重新开始' : '结束'}该会话吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    currentSession.value.status = newStatus
    ElMessage.success(`${newStatus === 'active' ? '会话已重新开始' : '会话已结束'}`)
  }).catch(() => {
    // 取消操作
  })
}

// 发送消息
const handleSendMessage = () => {
  if (!messageInput.value.trim() || !currentSession.value) return
  
  const newMessage = {
    id: Date.now(),
    sender_type: 'agent',
    sender_name: '客服小王',
    content: messageInput.value,
    created_at: new Date().toISOString()
  }
  
  currentSession.value.messages.push(newMessage)
  currentSession.value.last_message = messageInput.value
  currentSession.value.last_message_at = new Date().toISOString()
  
  messageInput.value = ''
  nextTick(() => {
    scrollToBottom()
  })
}

// 转接会话
const handleTransfer = () => {
  transferForm.value = {
    agent_id: '',
    reason: ''
  }
  transferDialogVisible.value = true
}

// 提交转接
const handleTransferSubmit = () => {
  if (!transferForm.value.agent_id) {
    ElMessage.warning('请选择要转接的客服')
    return
  }
  
  // TODO: 实现转接逻辑
  console.log('转接信息：', transferForm.value)
  ElMessage.success('转接成功')
  transferDialogVisible.value = false
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
}

// 组件挂载时滚动到底部
onMounted(() => {
  if (currentSession.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
})

// 搜索用户
const searchUsers = async (query: string) => {
  if (query) {
    userSearchLoading.value = true
    try {
      // 这里应该调用实际的API
      // const response = await searchUsersAPI(query)
      // searchUserResults.value = response.data
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      searchUserResults.value = [
        { id: 1, name: '张三', avatar: 'https://example.com/avatar1.jpg' },
        { id: 2, name: '李四', avatar: 'https://example.com/avatar2.jpg' }
      ]
    } finally {
      userSearchLoading.value = false
    }
  } else {
    searchUserResults.value = []
  }
}

// 创建新会话
const handleCreateSession = async () => {
  if (!newSessionFormRef.value) return
  
  await newSessionFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 这里应该调用实际的API
        // const response = await createSessionAPI(newSessionForm.value)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 创建新会话对象
        const newSession = {
          id: Date.now(),
          user_id: newSessionForm.value.userType === 'existing'
            ? newSessionForm.value.userId
            : Date.now(),
          user_name: newSessionForm.value.userType === 'existing'
            ? searchUserResults.value.find(u => u.id === newSessionForm.value.userId)?.name || '未知用户'
            : '新用户',
          user_avatar: newSessionForm.value.userType === 'existing'
            ? searchUserResults.value.find(u => u.id === newSessionForm.value.userId)?.avatar
            : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          status: 'active',
          last_message: newSessionForm.value.initialMessage,
          last_message_at: new Date().toISOString(),
          messages: [
            {
              id: Date.now(),
              sender_type: 'user',
              sender_name: newSessionForm.value.userType === 'existing'
                ? searchUserResults.value.find(u => u.id === newSessionForm.value.userId)?.name || '未知用户'
                : '新用户',
              content: newSessionForm.value.initialMessage,
              created_at: new Date().toISOString()
            }
          ]
        }
        
        // 添加到会话列表
        sessions.value.unshift(newSession)
        // 选中新创建的会话
        handleSelectSession(newSession)
        // 关闭对话框
        newSessionDialogVisible.value = false
        
        ElMessage.success('会话创建成功')
      } catch (error) {
        ElMessage.error('创建会话失败')
      }
    }
  })
}
</script>

<style scoped>
.chat-manage {
  padding: 20px;
}

.session-list {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  margin-bottom: 16px;
}

.session-items {
  flex: 1;
  overflow-y: auto;
}

.session-item {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.session-item:hover {
  background-color: #f5f7fa;
}

.session-item.active {
  background-color: #ecf5ff;
}

.session-info {
  display: flex;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 12px;
}

.username {
  font-weight: bold;
  color: #303133;
}

.last-message {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.session-meta {
  text-align: right;
}

.time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.chat-area {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 8px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}

.message-self {
  flex-direction: row-reverse;
}

.message-content {
  margin: 0 12px;
  max-width: 70%;
}

.message-self .message-content {
  text-align: right;
}

.message-info {
  margin-bottom: 4px;
}

.sender {
  font-weight: bold;
  color: #303133;
  margin-right: 8px;
}

.time {
  font-size: 12px;
  color: #909399;
}

.message-text {
  padding: 8px 12px;
  background-color: #f4f4f5;
  border-radius: 4px;
  word-break: break-all;
}

.message-self .message-text {
  background-color: #ecf5ff;
}

.input-area {
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

.input-actions {
  margin-top: 12px;
  text-align: right;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-id {
  color: #909399;
  font-size: 12px;
}

:deep(.el-select-dropdown__item) {
  padding: 8px 12px;
}
</style> 