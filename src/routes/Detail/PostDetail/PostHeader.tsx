import { CONFIG } from "../../../../site.config"
import Tag from "../../../components/Tag"
import { TPost } from "../../../types"
import { formatDate } from "../../../libs/utils"
import Image from "next/image"
import React from "react"
import styled from "@emotion/styled"

type Props = {
  data: TPost
}

const PostHeader: React.FC<Props> = ({ data }) => {
  return (
    <StyledWrapper>
      <h1 className="title">{data.title}</h1>
      {data.type[0] !== "Paper" && (
        <nav>
          <div className="top">
            {data.author && data.author[0] && data.author[0].name && (
              <>
                <div className="author">
                  <Image
                    css={{ borderRadius: "50%" }}
                    src={data.author[0].profile_photo || CONFIG.profile.image}
                    alt="profile_photo"
                    width={24}
                    height={24}
                  />
                  <div className="">{data.author[0].name}</div>
                </div>
                <div className="hr"></div>
              </>
            )}
            <div className="date">
              {formatDate(
                data?.date?.start_date || data.createdTime,
                CONFIG.lang
              )}
            </div>
          </div>
          <div className="mid">
            {data.tags && (
              <div className="tags">
                {data.tags.map((tag: string) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>
        </nav>
      )}
    </StyledWrapper>
  )
}

export default PostHeader

const StyledWrapper = styled.div`
  font-size: 1rem;
  line-height: 1.8;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.gray11};

  .title {
    font-size: 1.875rem;
    line-height: 2.35rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray11};
  }
  nav {
    margin-top: 1.5rem;
    color: ${({ theme }) => theme.colors.gray11};
    > .top {
      display: flex;
      margin-bottom: 0.75rem;
      gap: 0.75rem;
      align-items: center;
      .author {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        font-weight: 400;
      }
      .hr {
        margin-top: 0.25rem;
        margin-bottom: 0.25rem;
        align-self: stretch;
        width: 1px;
        background-color: ${({ theme }) => theme.colors.gray10};
      }
      .date {
        margin-right: 0.5rem;
        font-weight: 400;

        @media (min-width: 768px) {
          margin-left: 0;
        }
      }
    }
    > .mid {
      display: flex;
      margin-bottom: 1rem;
      align-items: center;
      .tags {
        display: flex;
        overflow-x: auto;
        flex-wrap: nowrap;
        gap: 0.5rem;
        max-width: 100%;
      }
    }
  }
`
