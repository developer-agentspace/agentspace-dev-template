import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { DateRangeFilter } from './DateRangeFilter';

describe('DateRangeFilter', () => {
  it('renders start and end date inputs', () => {
    render(<DateRangeFilter onFilterChange={vi.fn()} />);

    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });

  it('uses default dates when provided', () => {
    render(
      <DateRangeFilter
        onFilterChange={vi.fn()}
        defaultStartDate="2026-01-01"
        defaultEndDate="2026-01-31"
      />
    );

    expect(screen.getByLabelText('From')).toHaveValue('2026-01-01');
    expect(screen.getByLabelText('To')).toHaveValue('2026-01-31');
  });

  it('calls onFilterChange when start date changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DateRangeFilter
        onFilterChange={handleChange}
        defaultStartDate="2026-01-01"
        defaultEndDate="2026-01-31"
      />
    );

    const startInput = screen.getByLabelText('From');
    await user.clear(startInput);
    await user.type(startInput, '2026-02-01');

    expect(handleChange).toHaveBeenCalled();
  });

  it('calls onFilterChange when end date changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DateRangeFilter
        onFilterChange={handleChange}
        defaultStartDate="2026-01-01"
        defaultEndDate="2026-01-31"
      />
    );

    const endInput = screen.getByLabelText('To');
    await user.clear(endInput);
    await user.type(endInput, '2026-02-28');

    expect(handleChange).toHaveBeenCalled();
  });
});
