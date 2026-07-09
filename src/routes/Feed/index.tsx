import { useState } from "react"

import SearchInput from "./SearchInput"
import { FeedHeader } from "./FeedHeader"
import Footer from "./Footer"
import styled from "@emotion/styled"
import TagList from "./TagList"
import MobileProfileCard from "./MobileProfileCard"
import ProfileCard from "./ProfileCard"
import ServiceCard from "./ServiceCard"
import ContactCard from "./ContactCard"
import PostList from "./PostList"
import PinnedPosts from "./PostList/PinnedPosts"

const HEADER_HEIGHT = 73
const STICKY_TOP = HEADER_HEIGHT + 24

type Props = {}

const Feed: React.FC<Props> = () => {
  const [q, setQ] = useState("")

  return (
    <StyledWrapper>
      <div
        className="lt"
      >
        <TagList />
      </div>
      <div className="mid">
        <MobileProfileCard />
        <PinnedPosts q={q} />
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="tags">
          <TagList />
        </div>
        <FeedHeader />
        <PostList q={q} />
        <div className="footer">
          <Footer />
        </div>
      </div>
      <div
        className="rt"
      >
        <ProfileCard /> 
        <ContactCard />
        <div className="footer">
          <Footer />
        </div>
        {/* <ServiceCard /> */}
      </div>
    </StyledWrapper>
  )
}

export default Feed

const StyledWrapper = styled.div`
  grid-template-columns: repeat(12, minmax(0, 1fr));

  padding: 2.5rem 0 3rem;
  display: grid;
  gap: 1.75rem;

  @media (max-width: 768px) {
    display: block;
    padding: 1rem 0 2rem;
  }

  > .profile {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  > .lt {
    display: none;
    overflow-y: auto;
    position: sticky;
    grid-column: span 2 / span 2;
    top: ${STICKY_TOP}px;
    max-height: calc(100vh - ${STICKY_TOP}px - 2rem);
    padding-bottom: 1rem;

    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: 1024px) {
      display: block;
    }
  }

  > .mid {
    grid-column: span 12 / span 12;
    min-width: 0;

    @media (min-width: 1024px) {
      grid-column: span 7 / span 7;
    }

    > .tags {
      display: block;

      @media (min-width: 1024px) {
        display: none;
      }
    }

    > .footer {
      padding-bottom: 2rem;
      @media (min-width: 1024px) {
        display: none;
      }
    }
  }

  > .rt {
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }

    display: none;
    overflow-y: auto;
    position: sticky;
    top: ${STICKY_TOP}px;
    max-height: calc(100vh - ${STICKY_TOP}px - 2rem);
    padding-bottom: 1rem;

    @media (min-width: 1024px) {
      display: block;
      grid-column: span 3 / span 3;
    }

    .footer {
      padding-top: 1rem;
    }
  }
`
