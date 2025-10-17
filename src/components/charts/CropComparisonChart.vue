<template>
  <div class="result-card">
    <h3 class="text-lg font-semibold mb-4">
      作物用水量比較
    </h3>
    <div
      v-if="hasData"
      class="chart-container"
    >
      <v-chart
        :option="chartOption"
        autoresize
      />
    </div>
    <div
      v-else
      class="text-center py-12 text-gray-500"
    >
      <p>暫無資料</p>
      <p class="text-sm">
        新增不同作物的計算記錄後即可比較
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { transformForCropChart } from '@/utils/chartHelpers'

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
])

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
})

const hasData = computed(() => props.records.length > 0)

const chartData = computed(() => {
  if (!hasData.value) return { categories: [], data: [] }
  return transformForCropChart(props.records)
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow-sm',
    },
    formatter: (params) => {
      const { name, value } = params[0]
      const status = value > 2000 ? ' (超抽)' : ''
      return `${name}<br/>平均用水量: ${value.toFixed(2)} m³${status}`
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: chartData.value.categories,
    axisLabel: {
      fontSize: 12,
      rotate: chartData.value.categories.length > 4 ? 30 : 0,
    },
  },
  yAxis: {
    type: 'value',
    name: '用水量 (m³)',
    axisLabel: {
      formatter: '{value}',
      fontSize: 12,
    },
  },
  series: [
    {
      name: '平均用水量',
      type: 'bar',
      data: chartData.value.data,
      barWidth: '60%',
      label: {
        show: true,
        position: 'top',
        formatter: (params) => params.value.toFixed(0),
        fontSize: 11,
      },
      markLine: {
        silent: true,
        lineStyle: {
          type: 'dashed',
          color: '#f59e0b',
          width: 2,
        },
        data: [{ yAxis: 2000, name: '超抽閾值' }],
        label: {
          formatter: '超抽閾值',
          position: 'end',
        },
      },
    },
  ],
}))
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
}

@media (min-width: 640px) {
  .chart-container {
    height: 350px;
  }
}

@media (min-width: 1024px) {
  .chart-container {
    height: 400px;
  }
}
</style>
