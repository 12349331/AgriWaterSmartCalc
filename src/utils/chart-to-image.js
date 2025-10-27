/**
 * 圖表轉圖片工具
 * 使用 ECharts 原生 getDataURL() API 將圖表轉換為 Base64 圖片，供 PDF 使用
 */

import * as echarts from 'echarts'

/**
 * 將 DOM 元素中的所有 ECharts 圖表轉換為圖片
 * @param {HTMLElement} containerElement - 包含圖表的容器元素
 * @returns {Promise<void>}
 */
export async function convertChartsToImages(containerElement) {
  if (!containerElement) {
    console.warn('convertChartsToImages: 容器元素不存在')
    return
  }

  // 尋找所有圖表組件的外層容器
  // ReportCharts.vue 中的結構是: .chart-container > (.chart-title + SeasonalChart/CropComparisonChart/AnnualTrendChart)
  const outerContainers = containerElement.querySelectorAll('.report-section > .chart-container')

  console.log(`找到 ${outerContainers.length} 個外層圖表容器`)

  if (outerContainers.length === 0) {
    console.warn('未找到任何圖表容器')
    return
  }

  // 對每個圖表容器進行轉換
  const conversionPromises = Array.from(outerContainers).map(async (outerContainer, index) => {
    try {
      console.log(`開始轉換圖表 ${index + 1}`)

      // 保存圖表標題（在外層容器的直接子元素）
      const chartTitle = outerContainer.querySelector(':scope > .chart-title')
      const titleHTML = chartTitle ? chartTitle.outerHTML : ''
      console.log(`圖表 ${index + 1} 標題:`, chartTitle?.textContent.trim())

      // 尋找 vue-echarts 組件元素
      const vueEchartsElement = outerContainer.querySelector('x-vue-echarts, [class*="echarts"]')
      console.log(`圖表 ${index + 1} vue-echarts 元素:`, vueEchartsElement?.tagName, vueEchartsElement?.className)

      // 在所有子孫元素中尋找 ECharts 實例（包括 vue-echarts 元素本身）
      const allElements = outerContainer.querySelectorAll('*')
      console.log(`圖表 ${index + 1} 共找到 ${allElements.length} 個元素`)

      let echartsDiv = null
      let chartInstance = null

      // 先檢查 vue-echarts 元素本身
      if (vueEchartsElement) {
        chartInstance = echarts.getInstanceByDom(vueEchartsElement)
        if (chartInstance) {
          echartsDiv = vueEchartsElement
          console.log(`✅ 圖表 ${index + 1} 在 vue-echarts 元素本身找到 ECharts 實例`)
        }
      }

      // 如果沒找到，搜尋所有子元素
      if (!chartInstance) {
        for (const element of allElements) {
          chartInstance = echarts.getInstanceByDom(element)
          if (chartInstance) {
            echartsDiv = element
            console.log(`✅ 圖表 ${index + 1} 在 ${element.tagName}.${element.className} 找到 ECharts 實例`)
            break
          }
        }
      }

      if (!echartsDiv || !chartInstance) {
        console.warn(`❌ 圖表 ${index + 1} 未找到 ECharts DOM 元素`)
        console.log(`圖表 ${index + 1} 容器內容:`, outerContainer.innerHTML.substring(0, 300))
        return
      }

      console.log(`✅ 圖表 ${index + 1} 成功獲取 ECharts 實例`)

      // 使用 ECharts 原生 getDataURL() 方法
      const imageDataUrl = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2, // 高解析度
        backgroundColor: '#ffffff',
      })

      console.log(`圖表 ${index + 1} 成功轉換為圖片，長度: ${imageDataUrl.length}`)

      // 建立 img 元素
      const img = document.createElement('img')
      img.src = imageDataUrl
      img.style.width = '100%'
      img.style.height = 'auto'
      img.style.display = 'block'
      img.style.marginBottom = '20px'

      // 替換整個外層容器的內容（保留標題 + 圖片）
      outerContainer.innerHTML = titleHTML
      outerContainer.appendChild(img)

      console.log(`✅ 圖表 ${index + 1} 轉換完成`)
    } catch (error) {
      console.error(`圖表 ${index + 1} 轉換失敗`, error)
    }
  })

  // 等待所有圖表轉換完成
  await Promise.all(conversionPromises)
  console.log('所有圖表轉換完成')
}

/**
 * 恢復 ECharts 圖表（從圖片恢復為可互動的圖表）
 * 注意：這個函數目前不會被使用，因為我們會在 PDF 生成後直接銷毀模板
 * @param {HTMLElement} containerElement - 包含圖表的容器元素
 */
export function restoreCharts(containerElement) {
  // 由於我們在 PDF 生成後會銷毀整個模板，這個函數可能不需要實作
  // 保留作為未來擴展的參考
}
