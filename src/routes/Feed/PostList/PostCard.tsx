import Link from "next/link"
import { CONFIG } from "../../../../site.config"
import { formatDate } from "../../../libs/utils"
import Tag from "../../../components/Tag"
import { TPost } from "../../../types"
import Image from "next/image"
import Category from "../../../components/Category"
import styled from "@emotion/styled"

type Props = {
  data: TPost
}

const PostCard: React.FC<Props> = ({ data }) => {
  const category = (data.category && data.category?.[0]) || undefined

  return (
    <StyledWrapper href={`/${data.slug}`}>
      <article>
        {category && (
          <div className="category">
            <Category>{category}</Category>
          </div>
        )}
        <div
          data-thumb={!!data.thumbnail}
          data-category={!!category}
          className="content"
        >
          {data.thumbnail && (
            <div className="thumbnail">
              <Image
                src={data.thumbnail}
                fill
                alt={data.title}
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          <div className="wrapper">
            <div className="tags">
              {data.tags &&
                data.tags.map((tag: string, idx: number) => (
                  <Tag key={idx}>{`# ${tag}`}</Tag>
                ))}
            </div>
            <header className="top">
              <h2>{data.title}</h2>
            </header>
            <div className="date">
              <div className="content">
                {formatDate(
                  data?.date?.start_date || data.createdTime,
                  CONFIG.lang
                )}
              </div>
            </div>
            <div className="summary">
              <p>{data.summary}</p>
            </div>
          </div>
        </div>
      </article>
    </StyledWrapper>
  )
}

export default PostCard

const StyledWrapper = styled(Link)`
  article {
    overflow: hidden;
    position: relative;
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? "white" : theme.colors.gray4};
    transition-property: transform, box-shadow;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;

    &:hover {
      transform: scale(0.95);
      border-radius: 16px;
    }

    &:hover .top h2 {
      background-image: linear-gradient(
        90deg,
        #ffccdb,
        #ff6f9f,
        #ffccdb,
        #ff6f9f
      );
      background-size: 300% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: gradient-text 1.5s linear infinite;
    }

    > .category {
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 10;
    }

    > .content {
      padding: 2rem 1rem;
      display: flex;

      &[data-thumb="false"] {
        padding-top: 3.5rem;
      }
      &[data-category="false"] {
        padding-top: 1.5rem;
      }
      > .thumbnail {
        position: relative;
        width: 200px;
        object-fit: cover;
        background-color: ${({ theme }) => theme.colors.gray2};
      }
      > .wrapper {
        display: flex;
        flex-direction: column;
        /* padding-left only if thumbnail exists */
        padding-left: 1rem;

        /* Remove padding-left if no thumbnail */
        &[data-thumb="false"] {
          padding-left: 0;
        }

        > .top {
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          @media (min-width: 768px) {
            flex-direction: row;
            align-items: baseline;
          }
          h2 {
            margin-bottom: 0.5rem;
            font-size: 1.125rem;
            line-height: 1.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-position 300ms ease, color 300ms ease;

            @media (min-width: 768px) {
              font-size: 1.3rem;
              line-height: 1.75rem;
            }
          }
        }
        > .date {
          display: flex;
          margin-bottom: 1rem;
          gap: 0.5rem;
          align-items: center;
          .content {
            font-size: 0.875rem;
            line-height: 1.25rem;
            color: ${({ theme }) => theme.colors.gray10};
            @media (min-width: 768px) {
              margin-left: 0;
            }
          }
        }
        > .summary {
          p {
            display: none;
            margin: 0;
            line-height: 2rem;
            color: ${({ theme }) => theme.colors.gray11};

            @media (min-width: 768px) {
              display: block;
            }
          }
        }
        > .tags {
          display: flex;
          gap: 0.5rem;
        }
      }
    }
  }

  @keyframes gradient-text {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 100% 50%;
    }
  }
`
