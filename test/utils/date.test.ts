import { format } from 'date-fns'

import { DATE_FORMAT_SHORT, DATE_FORMAT_TIME } from '../../src/app/constants'
import { formatDate, formatDateTime } from '../../src/utils/date'

const ISO_SAMPLE = '2024-08-20T10:15:00.000Z' as const

describe('date utilities', () => {
  it('formats a date value', () => {
    const formatted = formatDate(ISO_SAMPLE)
    expect(formatted).toBe(format(new Date(ISO_SAMPLE), DATE_FORMAT_SHORT))
  })

  it('formats a date and time value', () => {
    const formatted = formatDateTime(ISO_SAMPLE)
    const expectedPrefix = format(new Date(ISO_SAMPLE), DATE_FORMAT_SHORT)
    const expectedSuffix = format(new Date(ISO_SAMPLE), DATE_FORMAT_TIME)
    expect(formatted).toBe(`${expectedPrefix} ${expectedSuffix}`)
  })

  it('accepts native Date instances', () => {
    const sampleDate = new Date(ISO_SAMPLE)
    expect(formatDate(sampleDate)).toBe(format(sampleDate, DATE_FORMAT_SHORT))
  })

  it('accepts timestamps when formatting date and time', () => {
    const timestamp = Date.parse(ISO_SAMPLE)
    const expectedPrefix = format(new Date(timestamp), DATE_FORMAT_SHORT)
    const expectedSuffix = format(new Date(timestamp), DATE_FORMAT_TIME)
    expect(formatDateTime(timestamp)).toBe(`${expectedPrefix} ${expectedSuffix}`)
  })
})
