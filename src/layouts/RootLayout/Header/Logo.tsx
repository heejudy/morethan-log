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

const StyledWrapper = styled(Link)``
