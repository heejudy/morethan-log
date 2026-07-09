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
    font-weight: 800;
  }
  > .mid {
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    border-radius: 999px;
    outline-style: none;
    width: 100%;
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? "rgba(255, 255, 255, 0.82)" : "rgba(33, 33, 39, 0.88)"};
    border: 1px solid
      ${({ theme }) =>
        theme.scheme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)"};
    box-shadow: ${({ theme }) =>
      theme.scheme === "light"
        ? "0 12px 30px rgba(37, 24, 16, 0.06)"
        : "0 12px 30px rgba(0, 0, 0, 0.18)"};

    &:focus {
      border-color: ${({ theme }) =>
        theme.scheme === "light" ? "rgba(236, 72, 153, 0.45)" : "rgba(34, 211, 238, 0.45)"};
    }
  }
`
