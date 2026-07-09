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
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0;
  color: ${({ theme }) => theme.colors.gray12};
`
