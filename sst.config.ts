/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "mega-platform",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const admin = new sst.aws.Nextjs("WebAdmin", {
      path: "apps/web-admin",
    });

    const storefront = new sst.aws.Nextjs("WebStorefront", {
      path: "apps/web-storefront",
    });

    // return {
    //   adminUrl: admin.url,
    //   storefrontUrl: storefront.url,
    // };
  },
});
