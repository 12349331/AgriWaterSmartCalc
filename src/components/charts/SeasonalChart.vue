<template>
  <div class="result-card">
    <h3 class="text-lg font-semibold mb-4">
      季節性用水趨勢
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
        新增計算記錄後即可查看趨勢
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { transformForSeasonalChart } from '@/utils/chartHelpers'

use([
  CanvasRenderer,
  LineChart,
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
  return transformForSeasonalChart(props.records)
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      const { name, value } = params[0]
      return `${name}<br/>平均用水量: ${value.toFixed(2)} m³`
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: chartData.value.categories,
    axisLabel: {
      fontSize: 12,
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
      type: 'line',
      data: chartData.value.data,
      smooth: true,
      lineStyle: {
        width: 3,
        color: '#3b82f6',
      },
      itemStyle: {
        color: '#3b82f6',
        borderWidth: 2,
        borderColor: '#fff',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
          ],
        },
      },
      markLine: {
        silent: true,
        lineStyle: {
          type: 'dashed',
          color: '#f59e0b',
        },
        data: [{ yAxis: 2000, name: '超抽閾值' }],
        label: {
          formatter: '超抽閾值: 2000 m³',
          position: 'end',
        },
      },
    },
  ],
}))
</script>

<style scoped>
.chart-container {
  height: 300px;
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
