const CONFIG = {
  // profile setting (required)
  profile: {
    name: "heeju Mo",
    image: "/app-icon.png", // If you want to create your own notion avatar, check out https://notion-avatar.vercel.app
    role: "frontend developer",
    bio: "heeju",
    email: "moheeju1223@gmail.com",
    linkedin: "",
    github: "heejudy",
    instagram: "",
  },
  projects: [
    {
      name: `heeju-log`,
      href: "https://github.com/heejudy/morethan-log",
    },
  ],
  // blog setting (required)
  blog: {
    title: "heeju-log",
    description: "heeju",
    scheme: "system", // 'light' | 'dark' | 'system'
  },

  // CONFIG configration (required)
  link: "https://heeju-blog.vercel.app",
  since: 2026, // If leave this empty, current year will be used.
  lang: "ko-KR", // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES', 'ko-KR']
  ogImageGenerateURL: "https://heeju-blog.vercel.app/og-image.png", // The link to generate OG image, don't end with a slash

  // notion configuration (required)
  notionConfig: {
    pageId: process.env.NOTION_PAGE_ID,
  },

  // plugin configuration (optional)
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
  // 댓글 기능
  utterances: {
    enable: true,
    config: {
      repo:
        process.env.NEXT_PUBLIC_UTTERANCES_REPO || "youngju6143/morethan-log",
      "issue-term": "og:title",
      label: "💬 Utterances",
    },
  },
  cusdis: {
    enable: false,
    config: {
      host: "https://cusdis.com",
      appid: "", // Embed Code -> data-app-id value
    },
  },
  isProd: process.env.VERCEL_ENV === "production", // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
  revalidateTime: 60 * 10, // revalidate time for [slug], index
}

module.exports = { CONFIG }
