import styled from "@emotion/styled"
import React, { InputHTMLAttributes, ReactNode } from "react"
import { Emoji } from "../../components/Emoji"

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

const SearchInput: React.FC<Props> = ({ ...props }) => {
  return (
    <StyledWrapper>
      <div className="top">
        <Emoji>🔎</Emoji> Search
      </div>
      <input
        className="mid"
        type="text"
        placeholder="Search Keyword..."
        {...props}
      />
    </StyledWrapper>
  )
}

export default SearchInput

const StyledWrapper = styled.div`
  margin-bottom: 1.25rem;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
  > .top {
    padding: 0.25rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
  }
  > .mid {
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    border-radius: 999px;
    outline-style: none;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.gray3};
    border: 1px solid ${({ theme }) => theme.colors.gray4};

    &:focus {
      border-color: ${({ theme }) =>
        theme.scheme === "light" ? theme.colors.gray7 : theme.colors.gray8};
    }
  }
`
