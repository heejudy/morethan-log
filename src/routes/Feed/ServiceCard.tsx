import { CONFIG } from "site.config"
import React from "react"
import { AiFillCodeSandboxCircle } from "react-icons/ai"
import styled from "@emotion/styled"
import { Emoji } from "src/components/Emoji"

const ServiceCard: React.FC = () => {
  if (!CONFIG.projects) return null
  return (
    <>
      <div className="p-1 mb-3 dark:text-white">🌟 Service</div>
      <ul className="flex flex-col p-1 bg-white rounded-2xl mb-9 dark:bg-zinc-700">
        {CONFIG.projects.map((project, index) => {
          return (
            <a
              key={project.name}
              href={`${project.href}`}
              rel="noreferrer"
              target="_blank"
              className="flex items-center gap-3 p-3 text-gray-500 cursor-pointer hover:underline hover:underline-offset-2 rounded-2xl dark:text-white hover:text-black dark:hover:text-white"
            >
              <AiOutlineLink className="text-2xl" />
              <div className="text-sm">{project.name}</div>
            </a>
          )
        })}
      </ul>
    </>
  )
}

export default ServiceCard

const StyledTitle = styled.div`
  padding: 0.25rem;
  margin-bottom: 0.75rem;
`

const StyledWrapper = styled.div`
  display: flex;
  padding: 0.25rem;
  margin-bottom: 2.25rem;
  flex-direction: column;
  border-radius: 1rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  > a {
    display: flex;
    padding: 0.75rem;
    gap: 0.75rem;
    align-items: center;
    border-radius: 1rem;
    color: ${({ theme }) => theme.colors.gray11};
    cursor: pointer;

    :hover {
      color: ${({ theme }) => theme.colors.gray12};
      background-color: ${({ theme }) => theme.colors.gray5};
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
