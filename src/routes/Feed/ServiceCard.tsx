import { CONFIG } from "site.config"
import React from "react"
import { AiOutlineLink } from "react-icons/ai"
import styled from "@emotion/styled"

const ServiceCard: React.FC = () => {
  if (!CONFIG.projects) return null

  return (
    <StyledWrapper>
      <div className="title">🌟 Service</div>

      <ul className="list">
        {CONFIG.projects.map((project, index) => {
          if (!project?.href || !project?.name) return null

          return (
            <li key={`${project.name}-${index}`}>
              <a
                href={project.href}
                rel="noreferrer"
                target="_blank"
                className="item"
              >
                <AiOutlineLink className="icon" />
                <div className="name">{project.name}</div>
              </a>
            </li>
          )
        })}
      </ul>
    </StyledWrapper>
  )
}

export default ServiceCard

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.25rem;
  margin-bottom: 2.25rem;

  .title {
    padding: 0.25rem;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    padding: 0.25rem;
    border-radius: 1rem;
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? "white" : theme.colors.gray4};
  }

  .item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: ${({ theme }) => theme.colors.gray11};
    text-decoration: none;
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.colors.gray12};
      background-color: ${({ theme }) => theme.colors.gray5};
    }
  }

  .icon {
    font-size: 1.5rem;
  }

  .name {
    font-size: 0.875rem;
  }
`