import Detail from "../routes/Detail"
import { filterPosts } from "../libs/utils/notion"
import { CONFIG } from "../../site.config"
import { NextPageWithLayout } from "../types"
import CustomError from "../routes/Error"
import { getPageContent, getPosts } from "../apis"
import MetaConfig from "../components/MetaConfig"
import { GetStaticProps } from "next"
import { queryClient } from "../libs/react-query"
import { queryKey } from "../constants/queryKey"
import { dehydrate } from "@tanstack/react-query"
import usePostQuery from "../hooks/usePostQuery"
import { FilterPostsOptions } from "../libs/utils/notion/filterPosts"

const filter: FilterPostsOptions = {
  acceptStatus: ["Public", "PublicOnDetail", "Private"],
  acceptType: ["Paper", "Post", "Page"],
}

export const getStaticPaths = async () => {
  const posts = await getPosts()
  const filteredPost = filterPosts(posts, filter)

  return {
    paths: filteredPost.map((row) => ({
      params: { slug: row.slug },
    })),
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = Array.isArray(context.params?.slug)
    ? context.params?.slug[0]
    : context.params?.slug

  console.log("🔥 slug:", slug)

  const posts = await getPosts()

  console.log("🔥 ALL POSTS:", posts.map(p => ({
    title: p.title,
    slug: p.slug,
    status: p.status,
    type: p.type,
  })))

  const detailPosts = filterPosts(posts, filter)
  console.log("🔥 detailPosts:", detailPosts)

  const postDetail = detailPosts.find(
    (t: any) => t.slug?.toLowerCase() === String(slug).toLowerCase()
  )

  console.log("🔥 postDetail:", postDetail)

  if (!postDetail) {
    console.log("❌ NOT FOUND:", slug)
    return { notFound: true }
  }

  const content = await getPageContent(postDetail.id)
  await queryClient.prefetchQuery(queryKey.post(String(slug)), () => ({
    ...postDetail,
    content,
  }))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

const DetailPage: NextPageWithLayout = () => {
  const post = usePostQuery()

  if (!post) return <CustomError />

  const image =
    post.thumbnail ??
    CONFIG.ogImageGenerateURL ??
    `${CONFIG.ogImageGenerateURL}/${encodeURIComponent(post.title)}.png`

  const date = post.date?.start_date || post.createdTime || ""

  const meta = {
    title: post.title,
    date: new Date(date).toISOString(),
    image: image,
    description: post.summary || "",
    type: post.type[0],
    url: `${CONFIG.link}/${post.slug}`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Detail />
    </>
  )
}

DetailPage.getLayout = (page) => {
  return <>{page}</>
}

export default DetailPage
