import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import DateRangeFilter from '@/components/common/DateRangeFilter.vue';

describe('DateRangeFilter.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(DateRangeFilter, {
      props: {
        startDate: null,
        endDate: null,
      },
    });
  });

  it('renders correctly with default props', () => {
    expect(wrapper.find('#start-date').exists()).toBe(true);
    expect(wrapper.find('#end-date').exists()).toBe(true);
    expect(wrapper.find('[data-test="apply-filter-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="clear-filter-button"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('開始日期');
    expect(wrapper.text()).toContain('結束日期');
  });

  it('displays current filter state when active', async () => {
    await wrapper.setProps({ startDate: '2025-01-01', endDate: '2025-01-31' });
    expect(wrapper.text()).toContain('目前篩選: 2025-01-01 ~ 2025-01-31');

    await wrapper.setProps({ startDate: '2025-01-01', endDate: null });
    expect(wrapper.text()).toContain('目前篩選: 2025-01-01 ~ 最晚');

    await wrapper.setProps({ startDate: null, endDate: '2025-01-31' });
    expect(wrapper.text()).toContain('目前篩選: 最早 ~ 2025-01-31');
  });

  it('emits update:startDate when start date changes', async () => {
    const startDateInput = wrapper.find('[data-test="start-date-input"]');
    await startDateInput.setValue('2025-03-01');
    expect(wrapper.emitted()['update:startDate'][0]).toEqual(['2025-03-01']);
  });

  it('emits update:endDate when end date changes', async () => {
    const endDateInput = wrapper.find('[data-test="end-date-input"]');
    await endDateInput.setValue('2025-03-31');
    expect(wrapper.emitted()['update:endDate'][0]).toEqual(['2025-03-31']);
  });

  it('emits apply event when apply button is clicked', async () => {
    await wrapper.find('[data-test="apply-filter-button"]').trigger('click');
    expect(wrapper.emitted().apply).toBeTruthy();
  });

  it('emits clear event when clear button is clicked', async () => {
    await wrapper.find('[data-test="clear-filter-button"]').trigger('click');
    expect(wrapper.emitted().clear).toBeTruthy();
  });
});
