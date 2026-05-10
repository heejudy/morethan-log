export const CONFIG = {
  profile: {
    name: "heeju Mo",
    image: "/app-icon.jpg",
    role: "frontend developer",
    bio: "heeju",
    email: "moheeju1223@gmail.com",
    linkedin: "",
    github: "heejudy",
    instagram: "",
  },
  projects: [
    {
      name: "heeju-log",
      href: "https://github.com/heejudy/morethan-log",
    },
  ],
  blog: {
    title: "heeju-log",
    description: "heeju",
    scheme: "system",
  },

  link: "https://heeju-blog.vercel.app",
  since: 2026,
  lang: "ko-KR",
  // ogImageGenerateURL: "https://heeju-blog.vercel.app/og-image.png",

  notionConfig: {
    pageId: process.env.NOTION_PAGE_ID,
  },

  googleAnalytics: {
    enable: true,
    config: {
      measurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID || "",
    },
  },

  googleSearchConsole: {
    enable: true,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  },

  naverSearchAdvisor: {
    enable: false,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || "",
    },
  },

  utterances: {
    enable: true,
    config: {
      repo:
        process.env.NEXT_PUBLIC_UTTERANCES_REPO ||
        "youngju6143/morethan-log",
      "issue-term": "og:title",
      label: "💬 Utterances",
    },
  },

  cusdis: {
    enable: false,
    config: {
      host: "https://cusdis.com",
      appid: "",
    },
  },

  isProd: process.env.VERCEL_ENV === "production",
  revalidateTime: 60 * 10,
}