/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "swatbloc",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        cloudflare: "6.10.0"
      }
    };
  },
  async run() {
    const admin = new sst.aws.Nextjs("WebAdmin", {
      path: "apps/web-admin",
      domain: $app.stage === "production" ? {
        name: "swatbloc.com",
        redirects: ["www.swatbloc.com"],
        dns: sst.cloudflare.dns(),
        aliases: ["*.swatbloc.com"]
      } : undefined,
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
      },
    });
  },
});
