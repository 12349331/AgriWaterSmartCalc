import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SortableTableHeader from '@/components/SortableTableHeader.vue';

describe('SortableTableHeader (T028)', () => {
  it('should display the label correctly', () => {
    const wrapper = mount(SortableTableHeader, {
      props: {
        label: '測試標籤',
        sortKey: 'testKey',
        currentSortKey: '',
        currentSortDirection: 'desc',
      },
    });
    expect(wrapper.text()).toContain('測試標籤');
  });

  it('should display no sort icon when not the current sort key', () => {
    const wrapper = mount(SortableTableHeader, {
      props: {
        label: '測試標籤',
        sortKey: 'testKey',
        currentSortKey: 'anotherKey',
        currentSortDirection: 'desc',
      },
    });
    expect(wrapper.find('svg').exists()).toBe(false);
  });

  it('should display ascending sort icon when current sort key and direction is asc', () => {
    const wrapper = mount(SortableTableHeader, {
      props: {
        label: '測試標籤',
        sortKey: 'testKey',
        currentSortKey: 'testKey',
        currentSortDirection: 'asc',
      },
    });
    expect(wrapper.find('.sort-icon-asc').exists()).toBe(true);
    expect(wrapper.find('.sort-icon-desc').exists()).toBe(false);
  });

  it('should display descending sort icon when current sort key and direction is desc', () => {
    const wrapper = mount(SortableTableHeader, {
      props: {
        label: '測試標籤',
        sortKey: 'testKey',
        currentSortKey: 'testKey',
        currentSortDirection: 'desc',
      },
    });
    expect(wrapper.find('.sort-icon-desc').exists()).toBe(true);
    expect(wrapper.find('.sort-icon-asc').exists()).toBe(false);
  });

  it('should emit sort event with key and default desc direction when new key is clicked', async () => {
    const wrapper = mount(SortableTableHeader, {
      props: {
        label: '測試標籤',
        sortKey: 'testKey',
        currentSortKey: 'anotherKey',
        currentSortDirection: 'asc',
      },
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted().sort).toBeDefined();
    expect(wrapper.emitted().sort[0]).toEqual(['testKey', 'desc']);
  });

  it('should emit sort event with toggled direction when current sort key is clicked', async () => {
    const wrapper = mount(SortableTableHeader, {
      props: {
        label: '測試標籤',
        sortKey: 'testKey',
        currentSortKey: 'testKey',
        currentSortDirection: 'asc',
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted().sort[0]).toEqual(['testKey', 'desc']);

    await wrapper.trigger('click');
    expect(wrapper.emitted().sort[1]).toEqual(['testKey', 'asc']);
  });

  it('should render with correct tooltip', async () => {
    const tooltipText = '這是計費期間的說明';
    const wrapper = mount(SortableTableHeader, {
      props: {
        label: '計費期間',
        sortKey: 'billingPeriodStart',
        currentSortKey: '',
        currentSortDirection: 'desc',
        tooltip: tooltipText,
      },
    });
    expect(wrapper.attributes('title')).toBe(tooltipText);
  });
});