import { faker } from '@faker-js/faker'
import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { BadgeText } from '../../../src/ui/typography/BadgeText'
import { BodyText } from '../../../src/ui/typography/BodyText'
import { EmptyState } from '../../../src/ui/typography/EmptyState'
import { Heading } from '../../../src/ui/typography/Heading'
import { KeyValueList } from '../../../src/ui/typography/KeyValueList'
import { MutedText } from '../../../src/ui/typography/MutedText'
import { buildKeyValueItem } from '../../ui/factories/uiFactories'
import {
  UI_CLASS_BADGE_TEXT,
  UI_CLASS_BODY_TEXT,
  UI_CLASS_BODY_TEXT_LEAD,
  UI_CLASS_EMPTY_STATE,
  UI_CLASS_EMPTY_STATE_ICON,
  UI_CLASS_HEADING_EYEBROW,
  UI_CLASS_MUTED_TEXT,
  UI_TEST_ID_BADGE_TEXT,
  UI_TEST_ID_EMPTY_STATE,
  UI_TEST_ID_KEY_VALUE_ITEM,
  UI_TEST_ID_KEY_VALUE_LIST,
} from '../../../src/ui/constants'

describe('Typography primitives', () => {
  test('Heading renders as requested level', () => {
    const text = faker.lorem.words(2)
    const { container } = render(<Heading level={2}>{text}</Heading>)

    expect(container.querySelector('h2')?.textContent).toBe(text)
  })

  test('Heading renders eyebrow text when provided', () => {
    const eyebrow = faker.lorem.word()
    const { getByText } = render(<Heading eyebrow={eyebrow}>{faker.lorem.words(2)}</Heading>)

    expect(getByText(eyebrow)).toHaveClass(UI_CLASS_HEADING_EYEBROW, { exact: false })
  })

  test('BodyText applies base typography class', () => {
    const content = faker.lorem.words(2)
    const { getByText } = render(<BodyText>{content}</BodyText>)

    expect(getByText(content)).toHaveClass(UI_CLASS_BODY_TEXT, { exact: false })
  })

  test('BodyText supports lead emphasis', () => {
    const content = faker.lorem.words(2)
    const { getByText } = render(<BodyText lead>{content}</BodyText>)

    expect(getByText(content)).toHaveClass(UI_CLASS_BODY_TEXT_LEAD, { exact: false })
  })

  test('MutedText wraps children with muted styling', () => {
    const content = faker.lorem.words(2)
    const { getByText } = render(<MutedText>{content}</MutedText>)

    expect(getByText(content)).toHaveClass(UI_CLASS_MUTED_TEXT, { exact: false })
  })

  test('BadgeText renders with variant classes', () => {
    const text = faker.lorem.word()
    const { getByTestId } = render(<BadgeText text={text} variant="success" />)

    expect(getByTestId(UI_TEST_ID_BADGE_TEXT)).toHaveClass(UI_CLASS_BADGE_TEXT, { exact: false })
  })

  test('KeyValueList renders provided items', () => {
    const items = [buildKeyValueItem(), buildKeyValueItem()]
    const { container, getAllByTestId, getByTestId } = render(<KeyValueList items={items} />)

    expect(getByTestId(UI_TEST_ID_KEY_VALUE_LIST).tagName).toBe('DL')
    expect(getAllByTestId(UI_TEST_ID_KEY_VALUE_ITEM).length).toBe(2)
    expect(container.querySelectorAll('dt')).toHaveLength(items.length)
  })

  test('EmptyState applies wrapper styling', () => {
    const { getByTestId } = render(<EmptyState title={faker.lorem.words(2)} body={faker.lorem.sentence()} />)

    expect(getByTestId(UI_TEST_ID_EMPTY_STATE)).toHaveClass(UI_CLASS_EMPTY_STATE, { exact: false })
  })

  test('EmptyState renders icon content with icon class', () => {
    const iconText = faker.lorem.word()
    const { getByText } = render(<EmptyState icon={<span>{iconText}</span>} title={faker.lorem.words(2)} />)

    expect(getByText(iconText).parentElement).toHaveClass(UI_CLASS_EMPTY_STATE_ICON, { exact: false })
  })
})
