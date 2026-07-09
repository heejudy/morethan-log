import { CONFIG } from "../../../site.config"
import Image from "next/image"
import React from "react"
import styled from "@emotion/styled"

type Props = {
  className?: string
}

const MobileProfileCard: React.FC<Props> = () => {
  return (
    <StyledWrapper>
      <div className="top">💻 Profile</div>
      <div className="mid">
        <div className="wrapper">
          <Image
            src={CONFIG.profile.image}
            width={90}
            height={90}
            css={{ position: "relative" }}
            alt="profile_image"
          />
          <div className="wrapper">
            <div className="top">{CONFIG.profile.name}</div>
            <div className="mid">{CONFIG.profile.role}</div>
            <div className="btm">{CONFIG.profile.bio}</div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  )
}

export default MobileProfileCard

const StyledWrapper = styled.div`
  display: block;

  @media (min-width: 1024px) {
    display: none;
  }

  > .top {
    padding: 0.25rem;
    margin-bottom: 0.75rem;
    font-weight: 800;
  }
  > .mid {
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 1.25rem;
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? "rgba(255, 255, 255, 0.84)" : "rgba(33, 33, 39, 0.88)"};
    border: 1px solid
      ${({ theme }) =>
        theme.scheme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)"};
    box-shadow: ${({ theme }) =>
      theme.scheme === "light"
        ? "0 14px 34px rgba(37, 24, 16, 0.07)"
        : "0 14px 34px rgba(0, 0, 0, 0.22)"};
    > .wrapper {
      display: flex;
      gap: 0.85rem;
      align-items: center;
      img {
        border-radius: 1rem;
        object-fit: cover;
      }
      > .wrapper {
        height: fit-content;
        > .top {
          font-size: 1.25rem;
          line-height: 1.75rem;
          font-weight: 800;
        }
        > .mid {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          color: ${({ theme }) => theme.colors.gray11};
        }
        > .btm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
      }
    }
  }
`
