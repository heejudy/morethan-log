module.exports = {
  images: {
    domains: [
      "notion.so",
      "www.notion.so",
      "lh5.googleusercontent.com",
      "s3.us-west-2.amazonaws.com",
      "s3-us-west-2.amazonaws.com",
      "prod-files-secure.s3.us-west-2.amazonaws.com",
    ],
  },
  async redirects() {
    return [
      {
        source: "/heeju-admin-deploy.tsx",
        destination: "/heeju-admin-deploy",
        permanent: true,
      },
    ]
  },
}
