import styled from "@emotion/styled"
import { useRouter } from "next/router"
import React from "react"

type Props = {
  children: string
}

const Tag: React.FC<Props> = ({ children }) => {
  const router = useRouter()

  const handleClick = (value: string) => {
    router.push(`/?tag=${value}`)
  }
  return (
    <StyledWrapper onClick={() => handleClick(children)}>
      {children}
    </StyledWrapper>
  )
}

export default Tag

const StyledWrapper = styled.div`
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.55rem;
  padding-right: 0.5rem;
  border-radius: 50px;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray11};
  background: ${({ theme }) =>
    theme.scheme === "light" ? "rgba(249, 115, 22, 0.08)" : "rgba(167, 139, 250, 0.12)"};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.gray12};
  }
`
