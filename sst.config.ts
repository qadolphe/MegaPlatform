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
    const stripeSecretKey = new sst.Secret("STRIPE_SECRET_KEY");
    const stripeTestSecretKey = new sst.Secret("STRIPE_TEST_SECRET_KEY");
    const stripeWebhookSecret = new sst.Secret("STRIPE_WEBHOOK_SECRET");
    const stripeWebhookSecretTest = new sst.Secret("STRIPE_WEBHOOK_SECRET_TEST");
    const supabaseServiceRoleKey = new sst.Secret("SUPABASE_SERVICE_ROLE_KEY");
    const geminiApiKey = new sst.Secret("GEMINI_API_KEY");

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
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey.value,
        STRIPE_SECRET_KEY: stripeSecretKey.value,
        STRIPE_TEST_SECRET_KEY: stripeTestSecretKey.value,
        STRIPE_WEBHOOK_SECRET: stripeWebhookSecret.value,
        STRIPE_WEBHOOK_SECRET_TEST: stripeWebhookSecretTest.value,
        GEMINI_API_KEY: geminiApiKey.value,
      },
    });
  },
});
