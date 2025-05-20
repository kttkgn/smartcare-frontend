<template>
  <div class="analytics">
    <!-- 时间范围选择 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据概览 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>总会话数</span>
              <el-tag type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ stats.totalSessions }}</div>
            <div class="trend">
              <span :class="{ 'up': stats.sessionTrend > 0, 'down': stats.sessionTrend < 0 }">
                {{ Math.abs(stats.sessionTrend) }}%
              </span>
              较上期
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
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
              较上期
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
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
              较上期
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>平均会话时长</span>
              <el-tag type="primary">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ stats.avgSessionDuration }}分钟</div>
            <div class="trend">
              <span :class="{ 'up': stats.durationTrend > 0, 'down': stats.durationTrend < 0 }">
                {{ Math.abs(stats.durationTrend) }}%
              </span>
              较上期
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
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

    <!-- 客服工作量统计 -->
    <el-card class="agent-stats">
      <template #header>
        <div class="card-header">
          <span>客服工作量统计</span>
          <el-button type="primary" size="small" @click="exportAgentStats">
            导出数据
          </el-button>
        </div>
      </template>
      <el-table
        :data="agentStats"
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="客服姓名" width="120" />
        <el-table-column prop="totalSessions" label="总会话数" width="100" />
        <el-table-column prop="avgResponseTime" label="平均响应时间" width="120">
          <template #default="{ row }">
            {{ row.avgResponseTime }}s
          </template>
        </el-table-column>
        <el-table-column prop="satisfactionRate" label="满意度" width="100">
          <template #default="{ row }">
            {{ row.satisfactionRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="avgSessionDuration" label="平均会话时长" width="120">
          <template #default="{ row }">
            {{ row.avgSessionDuration }}分钟
          </template>
        </el-table-column>
        <el-table-column prop="onlineTime" label="在线时长" width="120">
          <template #default="{ row }">
            {{ row.onlineTime }}小时
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'info'">
              {{ row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import * as XLSX from 'xlsx'

// 筛选表单
const filterForm = reactive({
  dateRange: [new Date(), new Date()]
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

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

// 会话分类数据
const sessionTypeData = [
  { value: 1048, name: '产品咨询', color: '#409EFF' },
  { value: 735, name: '技术支持', color: '#67C23A' },
  { value: 580, name: '账户问题', color: '#E6A23C' },
  { value: 484, name: '售后服务', color: '#F56C6C' },
  { value: 300, name: '其他', color: '#909399' }
]

// 图表实例
let sessionTrendChart: echarts.ECharts | null = null
let sessionTypeChart: echarts.ECharts | null = null

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

// 初始化会话分类图表
const initSessionTypeChart = () => {
  const chartDom = document.getElementById('sessionTypeChart')
  if (!chartDom) return
  
  sessionTypeChart = echarts.init(chartDom)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
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
        data: sessionTypeData.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color
          }
        }))
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

// 统计数据
const stats = reactive({
  totalSessions: 1234,
  sessionTrend: 12.5,
  avgResponseTime: 45,
  responseTimeTrend: -8.3,
  satisfactionRate: 95.8,
  satisfactionTrend: 2.1,
  avgSessionDuration: 15,
  durationTrend: 5.2
})

// 客服统计数据
const agentStats = ref([
  {
    name: '客服小王',
    totalSessions: 156,
    avgResponseTime: 42,
    satisfactionRate: 96.5,
    avgSessionDuration: 14,
    onlineTime: 8,
    status: 'online'
  },
  {
    name: '客服小李',
    totalSessions: 142,
    avgResponseTime: 45,
    satisfactionRate: 95.2,
    avgSessionDuration: 16,
    onlineTime: 7.5,
    status: 'online'
  },
  {
    name: '客服小张',
    totalSessions: 128,
    avgResponseTime: 48,
    satisfactionRate: 94.8,
    avgSessionDuration: 15,
    onlineTime: 8,
    status: 'offline'
  }
])

// 处理日期变化
const handleDateChange = (val: any) => {
  console.log('日期范围：', val)
}

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索逻辑
  console.log('搜索条件：', filterForm)
}

// 重置筛选
const resetFilter = () => {
  filterForm.dateRange = [new Date(), new Date()]
  handleSearch()
}

// 导出客服统计数据
const exportAgentStats = () => {
  try {
    // 准备导出数据
    const exportData = agentStats.value.map(agent => ({
      '客服姓名': agent.name,
      '总会话数': agent.totalSessions,
      '平均响应时间(秒)': agent.avgResponseTime,
      '满意度(%)': agent.satisfactionRate,
      '平均会话时长(分钟)': agent.avgSessionDuration,
      '在线时长(小时)': agent.onlineTime,
      '状态': agent.status === 'online' ? '在线' : '离线'
    }))

    // 创建工作簿
    const wb = XLSX.utils.book_new()
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    // 设置列宽
    const colWidths = [
      { wch: 10 }, // 客服姓名
      { wch: 10 }, // 总会话数
      { wch: 15 }, // 平均响应时间
      { wch: 10 }, // 满意度
      { wch: 15 }, // 平均会话时长
      { wch: 12 }, // 在线时长
      { wch: 8 }   // 状态
    ]
    ws['!cols'] = colWidths

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '客服工作量统计')

    // 生成文件名
    const fileName = `客服工作量统计_${new Date().toLocaleDateString()}.xlsx`

    // 导出文件
    XLSX.writeFile(wb, fileName)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}
</script>

<style scoped>
.analytics {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.data-overview {
  margin-bottom: 20px;
}

.data-card {
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

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
}

.agent-stats {
  margin-bottom: 20px;
}
</style> 