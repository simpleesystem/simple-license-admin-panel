import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { TableFilter } from '@/ui/data/TableFilter'

describe('TableFilter', () => {
  const defaultProps = {
    value: '',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    onChange: vi.fn(),
  }

  it('renders select with options', () => {
    render(<TableFilter {...defaultProps} />)

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<TableFilter {...defaultProps} label="Test Label" />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders placeholder when provided', () => {
    render(<TableFilter {...defaultProps} placeholder="Select an option" />)

    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('calls onChange when selection changes', () => {
    render(<TableFilter {...defaultProps} />)

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'option1' } })

    expect(defaultProps.onChange).toHaveBeenCalledWith('option1')
  })

  it('reflects value prop', () => {
    render(<TableFilter {...defaultProps} value="option2" />)

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('option2')
  })

  it('disables select when disabled prop is true', () => {
    render(<TableFilter {...defaultProps} disabled={true} />)

    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = render(<TableFilter {...defaultProps} className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders disabled options', () => {
    const props = {
      ...defaultProps,
      options: [{ value: 'option1', label: 'Option 1', disabled: true }],
    }
    render(<TableFilter {...props} />)

    const option = screen.getByText('Option 1') as HTMLOptionElement
    expect(option.disabled).toBe(true)
  })
})
