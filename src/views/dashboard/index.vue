<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日会话数</span>
              <el-tag type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ stats.todaySessions }}</div>
            <div class="trend">
              <span :class="{ 'up': stats.sessionTrend > 0, 'down': stats.sessionTrend < 0 }">
                {{ Math.abs(stats.sessionTrend) }}%
              </span>
              较昨日
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>在线客服</span>
              <el-tag type="primary">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ stats.onlineAgents }}</div>
            <div class="trend">
              总客服数: {{ stats.totalAgents }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>平均响应时间</span>
              <el-tag type="warning">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ stats.avgResponseTime }}s</div>
            <div class="trend">
              <span :class="{ 'up': stats.responseTimeTrend < 0, 'down': stats.responseTimeTrend > 0 }">
                {{ Math.abs(stats.responseTimeTrend) }}%
              </span>
              较昨日
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>客户满意度</span>
              <el-tag type="info">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ stats.satisfactionRate }}%</div>
            <div class="trend">
              <span :class="{ 'up': stats.satisfactionTrend > 0, 'down': stats.satisfactionTrend < 0 }">
                {{ Math.abs(stats.satisfactionTrend) }}%
              </span>
              较昨日
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>会话趋势</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div id="sessionTrendChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>会话分类</span>
            </div>
          </template>
          <div id="sessionTypeChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>热门问题</span>
              <el-button type="primary" link @click="handleViewMore">
                查看更多
              </el-button>
            </div>
          </template>
          <div class="question-list">
            <div
              v-for="(question, index) in hotQuestions"
              :key="index"
              class="question-item"
              @click="showQuestionDetail(question)"
            >
              <span class="question-title">{{ question.title }}</span>
              <span class="question-count">{{ question.count }}次</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 问题详情对话框 -->
    <el-dialog
      v-model="questionDetailVisible"
      :title="currentQuestion?.title"
      width="600px"
      destroy-on-close
    >
      <div class="question-detail">
        <div class="detail-header">
          <el-tag size="small" :type="getQuestionTypeTag(currentQuestion?.type)">
            {{ getQuestionTypeLabel(currentQuestion?.type) }}
          </el-tag>
          <span class="view-count">浏览 {{ currentQuestion?.viewCount || 0 }} 次</span>
        </div>
        <div class="detail-content">
          <div class="question-section">
            <h4>问题描述</h4>
            <p>{{ currentQuestion?.content }}</p>
          </div>
          <div class="answer-section">
            <h4>标准答案</h4>
            <p>{{ currentQuestion?.answer }}</p>
          </div>
          <div class="related-section" v-if="currentQuestion?.relatedQuestions?.length">
            <h4>相关问题</h4>
            <ul>
              <li
                v-for="(related, index) in currentQuestion?.relatedQuestions"
                :key="index"
                @click="showQuestionDetail(related)"
              >
                {{ related.title }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="questionDetailVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleCopyAnswer">
            复制答案
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

// 统计数据
const stats = ref({
  todaySessions: 156,
  sessionTrend: 12.5,
  onlineAgents: 8,
  totalAgents: 12,
  avgResponseTime: 45,
  responseTimeTrend: -8.3,
  satisfactionRate: 95.8,
  satisfactionTrend: 2.1
})

// 图表时间范围
const chartTimeRange = ref('today')

// 会话趋势数据
const sessionTrendData = {
  today: {
    xAxis: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    data: [30, 25, 20, 45, 80, 120, 150, 100]
  },
  week: {
    xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    data: [320, 280, 350, 420, 380, 450, 400]
  },
  month: {
    xAxis: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
    data: [1200, 1500, 1800, 1600, 2000, 2200, 1900]
  }
}

// 监听时间范围变化
watch(chartTimeRange, (newValue) => {
  updateSessionTrendChart(newValue)
})

// 更新会话趋势图表
const updateSessionTrendChart = (timeRange: string) => {
  if (!sessionTrendChart) return
  
  const data = sessionTrendData[timeRange as keyof typeof sessionTrendData]
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.xAxis,
      axisLabel: {
        color: '#606266'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#606266'
      }
    },
    series: [
      {
        name: '会话数',
        type: 'line',
        smooth: true,
        data: data.data,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64,158,255,0.3)'
            },
            {
              offset: 1,
              color: 'rgba(64,158,255,0.1)'
            }
          ])
        }
      }
    ]
  }
  
  sessionTrendChart.setOption(option)
}

// 初始化会话趋势图表
const initSessionTrendChart = () => {
  const chartDom = document.getElementById('sessionTrendChart')
  if (!chartDom) return
  
  sessionTrendChart = echarts.init(chartDom)
  updateSessionTrendChart(chartTimeRange.value)
}

// 热门问题详情
const questionDetailVisible = ref(false)
const currentQuestion = ref<any>(null)

// 模拟热门问题数据
const hotQuestions = ref([
  {
    id: 1,
    title: '如何修改账户密码？',
    count: 128,
    type: 'account',
    content: '用户想要修改账户密码，需要了解具体的操作步骤。',
    answer: '1. 登录您的账户\n2. 点击右上角的"个人中心"\n3. 选择"账户安全"\n4. 点击"修改密码"\n5. 输入原密码和新密码\n6. 点击"确认修改"完成操作',
    viewCount: 256,
    relatedQuestions: [
      { id: 2, title: '忘记密码怎么办？' },
      { id: 3, title: '如何设置安全问题？' }
    ]
  },
  {
    id: 2,
    title: '忘记密码怎么办？',
    count: 98,
    type: 'account',
    content: '用户忘记了账户密码，需要找回密码。',
    answer: '1. 在登录页面点击"忘记密码"\n2. 输入注册时使用的手机号或邮箱\n3. 获取验证码并输入\n4. 设置新密码\n5. 完成密码重置',
    viewCount: 196,
    relatedQuestions: [
      { id: 1, title: '如何修改账户密码？' },
      { id: 4, title: '如何绑定手机号？' }
    ]
  },
  {
    id: 3,
    title: '如何查看历史订单？',
    count: 87,
    type: 'order',
    content: '用户需要查看自己的历史订单记录。',
    answer: '1. 登录您的账户\n2. 点击"我的订单"\n3. 在订单列表中可以查看所有历史订单\n4. 可以使用筛选功能按时间、状态等条件筛选订单',
    viewCount: 174,
    relatedQuestions: [
      { id: 5, title: '如何导出订单记录？' },
      { id: 6, title: '订单状态说明' }
    ]
  },
  {
    id: 4,
    title: '如何联系客服？',
    count: 76,
    type: 'service',
    content: '用户需要联系客服解决问题。',
    answer: '您可以通过以下方式联系客服：\n1. 在线客服：点击右下角的客服图标\n2. 电话客服：400-123-4567（工作日 9:00-18:00）\n3. 邮件客服：support@example.com',
    viewCount: 152,
    relatedQuestions: [
      { id: 7, title: '客服工作时间' },
      { id: 8, title: '如何提交工单？' }
    ]
  },
  {
    id: 5,
    title: '如何申请退款？',
    count: 65,
    type: 'refund',
    content: '用户需要申请订单退款。',
    answer: '1. 登录您的账户\n2. 进入"我的订单"\n3. 找到需要退款的订单\n4. 点击"申请退款"\n5. 选择退款原因\n6. 提交退款申请\n7. 等待审核通过',
    viewCount: 130,
    relatedQuestions: [
      { id: 9, title: '退款到账时间' },
      { id: 10, title: '退款政策说明' }
    ]
  }
])

// 显示问题详情
const showQuestionDetail = (question: any) => {
  currentQuestion.value = question
  questionDetailVisible.value = true
}

// 获取问题类型标签
const getQuestionTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    account: 'primary',
    order: 'success',
    service: 'warning',
    refund: 'danger'
  }
  return typeMap[type] || 'info'
}

// 获取问题类型标签文本
const getQuestionTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    account: '账户问题',
    order: '订单问题',
    service: '服务问题',
    refund: '退款问题'
  }
  return typeMap[type] || '其他'
}

// 复制答案
const handleCopyAnswer = () => {
  if (currentQuestion.value?.answer) {
    navigator.clipboard.writeText(currentQuestion.value.answer)
      .then(() => {
        ElMessage.success('答案已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动复制')
      })
  }
}

// 查看更多
const handleViewMore = () => {
  // TODO: 跳转到FAQ页面
  ElMessage.info('跳转到FAQ页面')
}

// 图表实例
let sessionTrendChart: echarts.ECharts | null = null
let sessionTypeChart: echarts.ECharts | null = null

// 初始化会话分类图表
const initSessionTypeChart = () => {
  const chartDom = document.getElementById('sessionTypeChart')
  if (!chartDom) return
  
  sessionTypeChart = echarts.init(chartDom)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: '#606266'
      }
    },
    series: [
      {
        name: '会话分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '产品咨询' },
          { value: 735, name: '技术支持' },
          { value: 580, name: '账户问题' },
          { value: 484, name: '售后服务' },
          { value: 300, name: '其他' }
        ]
      }
    ]
  }
  
  sessionTypeChart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  sessionTrendChart?.resize()
  sessionTypeChart?.resize()
}

onMounted(() => {
  initSessionTrendChart()
  initSessionTypeChart()
  window.addEventListener('resize', handleResize)
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  sessionTrendChart?.dispose()
  sessionTypeChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.stat-card {
  height: 180px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.number {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.trend {
  font-size: 14px;
  color: #909399;
}

.trend .up {
  color: #67c23a;
}

.trend .down {
  color: #f56c6c;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 20px;
}

.hot-questions {
  margin-bottom: 20px;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.question-item:hover {
  background-color: #f5f7fa;
}

.question-title {
  color: #303133;
  font-size: 14px;
}

.question-count {
  color: #909399;
  font-size: 12px;
}

.question-detail {
  padding: 0 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.view-count {
  color: #909399;
  font-size: 12px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-content h4 {
  color: #303133;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.detail-content p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

.related-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.related-section li {
  color: #409EFF;
  cursor: pointer;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.related-section li:last-child {
  border-bottom: none;
}

.related-section li:hover {
  color: #66b1ff;
}
</style> 