import { TCategories } from "../../../types"
import React from "react"
import CategorySelect from "./CategorySelect"
import OrderButtons from "./OrderButtons"
import styled from "@emotion/styled"

type Props = {}

const FeedHeader: React.FC<Props> = () => {
  return (
    <StyledWrapper>
      <CategorySelect />
      <OrderButtons />
    </StyledWrapper>
  )
}

export default FeedHeader

const StyledWrapper = styled.div`
  display: flex;
  margin-bottom: 1.25rem;
  padding: 0.75rem 0;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid
    ${({ theme }) =>
      theme.scheme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)"};
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.scheme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)"};
`
