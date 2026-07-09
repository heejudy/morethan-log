import Link from "next/link"
import styled from "@emotion/styled"
import { CONFIG } from "../../../../site.config"

const Logo = () => {
  return (
    <StyledWrapper href="/" aria-label={CONFIG.blog.title}>
      {CONFIG.blog.title}
    </StyledWrapper>
  )
}

export default Logo

const StyledWrapper = styled(Link)`
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0;
  color: ${({ theme }) => theme.colors.gray12};

  &:after {
    content: "";
    display: block;
    width: 1.75rem;
    height: 2px;
    margin-top: 0.2rem;
    border-radius: 999px;
    background: ${({ theme }) =>
      theme.scheme === "light"
        ? "linear-gradient(90deg, #f97316, #ec4899)"
        : "linear-gradient(90deg, #a78bfa, #22d3ee)"};
  }
`
