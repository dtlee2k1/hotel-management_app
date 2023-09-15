import { useSearchParams } from 'react-router-dom'
import styled, { css } from 'styled-components'
import Option from '../types/options.type'

interface FilterButtonProps {
  $active: boolean
}

const StyledFilter = styled.div`
  border: 1px solid var(--color-grey-100);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius-sm);
  padding: 0.4rem;
  display: flex;
  gap: 0.4rem;
`

const FilterButton = styled.button<FilterButtonProps>`
  background-color: var(--color-grey-0);
  border: none;

  ${(props) =>
    props.$active &&
    css`
      background-color: var(--color-brand-600);
      color: var(--color-brand-50);
    `}

  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 1.4rem;
  /* To give the same height as select */
  padding: 0.44rem 0.8rem;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background-color: var(--color-brand-600);
    color: var(--color-brand-50);
  }
`

interface FilterProps {
  filterField: string
  options: Option[]
  searchParamsToReset?: {
    key: string
    value: number
  }[]
}

export default function Filter({ filterField, options, searchParamsToReset }: FilterProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  // get active value
  const currFilter = searchParams.get(filterField) || options[0].value

  const handleClick = (value: string) => {
    searchParams.set(filterField, value)

    // Option to RESET all `searchParams` not needed when switching between `filterField`
    if (searchParamsToReset) {
      searchParamsToReset.map((params) => searchParams.set(params.key, String(params.value)))
    }
    setSearchParams(searchParams)
  }

  return (
    <StyledFilter>
      {options.map((option) => (
        <FilterButton
          key={option.value}
          $active={option.value === currFilter}
          onClick={() => handleClick(option.value)}
        >
          {option.label}
        </FilterButton>
      ))}
    </StyledFilter>
  )
}
