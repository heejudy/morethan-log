import styled from "@emotion/styled"
import React from "react"
import {
  AiFillLinkedin,
  AiOutlineGithub,
  AiOutlineInstagram,
  AiOutlineMail,
} from "react-icons/ai"
import { CONFIG } from "../../../site.config"
import { Emoji } from "../../components/Emoji"

const ContactCard: React.FC = () => {
  return (
    <StyledWrapper>
      {CONFIG.profile.github && (
        <a
          href={`https://github.com/${CONFIG.profile.github}`}
          rel="noreferrer"
          target="_blank"
        >
          <AiOutlineGithub className="icon" />
          <div className="name">github</div>
        </a>
      )}
      {CONFIG.profile.instagram && (
        <a
          href={`https://www.instagram.com/${CONFIG.profile.instagram}`}
          rel="noreferrer"
          target="_blank"
        >
          <AiOutlineInstagram className="icon" />
          <div className="name">instagram</div>
        </a>
      )}
      {CONFIG.profile.email && (
        <a
          href={`mailto:${CONFIG.profile.email}`}
          rel="noreferrer"
          target="_blank"
          css={{ overflow: "hidden" }}
        >
          <AiOutlineMail className="icon" />
          <div className="name">email</div>
        </a>
      )}
      {CONFIG.profile.linkedin && (
        <a
          href={`https://www.linkedin.com/in/${CONFIG.profile.linkedin}`}
          rel="noreferrer"
          target="_blank"
        >
          <AiFillLinkedin className="icon" />
          <div className="name">linkedin</div>
        </a>
      )}
    </StyledWrapper>
  )
}

export default ContactCard

const StyledTitle = styled.div`
  padding: 0.25rem;
  margin-bottom: 0.75rem;
`
const StyledWrapper = styled.div`
  display: flex;
  padding: 0.35rem;
  flex-direction: column;
  border-radius: 1.25rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "rgba(255, 255, 255, 0.82)" : "rgba(33, 33, 39, 0.88)"};
  border: 1px solid
    ${({ theme }) =>
      theme.scheme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)"};
  a {
    display: flex;
    padding: 0.75rem;
    gap: 0.75rem;
    align-items: center;
    border-radius: 0.9rem;
    color: ${({ theme }) => theme.colors.gray11};
    cursor: pointer;

    :hover {
      color: ${({ theme }) => theme.colors.gray12};
      background-color: ${({ theme }) =>
        theme.scheme === "light" ? "rgba(236, 72, 153, 0.08)" : "rgba(34, 211, 238, 0.08)"};
    }
    .icon {
      font-size: 1.5rem;
      line-height: 2rem;
    }
    .name {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  }
`
