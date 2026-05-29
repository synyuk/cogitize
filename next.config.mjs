/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const config = () => {
  /** @type {import('next').NextConfig} */
  const config = {
    redirects: async () => {
      return [
        {
          source: "/",
          destination: "/guide",
          permanent: true,
        },
      ];
    },
    env: {},
    reactStrictMode: false,
    images: {
      unoptimized: true,
    },
  };

  return withNextIntl(config);
};

export default config;
