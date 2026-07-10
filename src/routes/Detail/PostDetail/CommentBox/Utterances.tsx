import { CONFIG } from "../../../../../site.config"
import { useEffect, useRef } from "react"
import styled from "@emotion/styled"
import useScheme from "../../../../hooks/useScheme"

type Props = {
  issueTerm: string
}

const Utterances: React.FC<Props> = ({ issueTerm }) => {
  const [scheme] = useScheme()
  const commentsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const theme = `github-${scheme}`
    const script = document.createElement("script")
    const anchor = commentsRef.current
    if (!anchor) return

    anchor.replaceChildren()
    script.setAttribute("src", "https://utteranc.es/client.js")
    script.setAttribute("crossorigin", "anonymous")
    script.setAttribute("async", `true`)
    script.setAttribute("issue-term", issueTerm)
    script.setAttribute("theme", theme)
    const config: Record<string, string> = CONFIG.utterances.config
    Object.keys(config).forEach((key) => {
      if (key === "issue-term") return
      script.setAttribute(key, config[key])
    })
    anchor.appendChild(script)

    return () => {
      if (anchor.isConnected) {
        anchor.replaceChildren()
      }
    }
  }, [issueTerm])

  return (
    <>
      <StyledWrapper id="comments" ref={commentsRef}>
        <div className="utterances-frame"></div>
      </StyledWrapper>
    </>
  )
}

export default Utterances

const StyledWrapper = styled.div`
  @media (min-width: 768px) {
    margin-left: -4rem;
  }
`
