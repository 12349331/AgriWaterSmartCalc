import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import HistoryTable from '@/components/history/HistoryTable.vue'
import { useHistoryStore } from '@/stores/history'

describe('HistoryTable.vue - PDF Export Feature', () => {
  let wrapper
  let historyStore

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    historyStore = useHistoryStore()

    wrapper = mount(HistoryTable, {
      global: {
        plugins: [pinia],
        stubs: {
          StatsSummary: true,
          SortableTableHeader: true,
        },
      },
    })
  })

  describe('PDF Export Button Visibility', () => {
    it('should not display "匯出 PDF" button when no records exist', () => {
      historyStore.clearAllRecords()

      const buttons = wrapper.findAll('button')
      const pdfButton = buttons.find(btn => btn.text() === '匯出 PDF')

      expect(pdfButton).toBeUndefined()
    })

    it('should display "匯出 PDF" button when records exist', () => {
      historyStore.addRecord({
        billAmount: 1500,
        electricityType: '表燈非營業用',
        calculatedKwh: 500,
        monthlyVolume: 150,
      })

      const buttons = wrapper.findAll('button')
      const pdfButton = buttons.find(btn => btn.text() === '匯出 PDF')

      expect(pdfButton).toBeDefined()
      expect(pdfButton.exists()).toBe(true)
    })

    it('should display PDF button alongside CSV and JSON buttons', () => {
      historyStore.addRecord({
        billAmount: 1500,
        calculatedKwh: 500,
        monthlyVolume: 150,
      })

      const buttons = wrapper.findAll('button')
      const buttonTexts = buttons.map(btn => btn.text())

      expect(buttonTexts).toContain('匯出 CSV')
      expect(buttonTexts).toContain('匯出 JSON')
      expect(buttonTexts).toContain('匯出 PDF')
    })
  })

  describe('PDF Export Button Behavior', () => {
    beforeEach(() => {
      // Add at least one record to make PDF button visible
      historyStore.addRecord({
        billAmount: 1500,
        calculatedKwh: 500,
        monthlyVolume: 150,
      })
    })

    it('should emit "export" event with "pdf" parameter when clicked', async () => {
      const buttons = wrapper.findAll('button')
      const pdfButton = buttons.find(btn => btn.text() === '匯出 PDF')

      await pdfButton.trigger('click')

      expect(wrapper.emitted()).toHaveProperty('export')
      expect(wrapper.emitted('export')).toHaveLength(1)
      expect(wrapper.emitted('export')[0]).toEqual(['pdf'])
    })

    it('should have consistent styling with CSV and JSON buttons', () => {
      const buttons = wrapper.findAll('button')
      const csvButton = buttons.find(btn => btn.text() === '匯出 CSV')
      const jsonButton = buttons.find(btn => btn.text() === '匯出 JSON')
      const pdfButton = buttons.find(btn => btn.text() === '匯出 PDF')

      // All export buttons should have similar classes
      const csvClasses = csvButton.classes()
      const jsonClasses = jsonButton.classes()
      const pdfClasses = pdfButton.classes()

      // Check they all have border and hover styles
      const hasCommonClasses = (classes) => {
        return classes.some(c => c.includes('border')) &&
               classes.some(c => c.includes('hover'))
      }

      expect(hasCommonClasses(csvClasses)).toBe(true)
      expect(hasCommonClasses(jsonClasses)).toBe(true)
      expect(hasCommonClasses(pdfClasses)).toBe(true)
    })
  })

  describe('Button Position', () => {
    it('should be positioned in the header actions area', () => {
      historyStore.addRecord({
        billAmount: 1500,
        calculatedKwh: 500,
        monthlyVolume: 150,
      })

      // PDF button should be in the button group with CSV and JSON
      const buttonContainer = wrapper.find('.flex.space-x-2')
      expect(buttonContainer.exists()).toBe(true)

      const buttonsInContainer = buttonContainer.findAll('button')
      const pdfButton = buttonsInContainer.find(btn => btn.text() === '匯出 PDF')

      expect(pdfButton).toBeDefined()
    })
  })

  describe('Integration with Export Handler', () => {
    it('should not break existing CSV export', async () => {
      historyStore.addRecord({
        billAmount: 1500,
        calculatedKwh: 500,
        monthlyVolume: 150,
      })

      const buttons = wrapper.findAll('button')
      const csvButton = buttons.find(btn => btn.text() === '匯出 CSV')

      await csvButton.trigger('click')

      expect(wrapper.emitted()).toHaveProperty('export')
      expect(wrapper.emitted('export')[0]).toEqual(['csv'])
    })

    it('should not break existing JSON export', async () => {
      historyStore.addRecord({
        billAmount: 1500,
        calculatedKwh: 500,
        monthlyVolume: 150,
      })

      const buttons = wrapper.findAll('button')
      const jsonButton = buttons.find(btn => btn.text() === '匯出 JSON')

      await jsonButton.trigger('click')

      expect(wrapper.emitted()).toHaveProperty('export')
      expect(wrapper.emitted('export')[0]).toEqual(['json'])
    })
  })
})
