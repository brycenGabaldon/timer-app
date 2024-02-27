import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {" "}
        {/* Essential for web apps on iOS */}
        <meta name="viewport" content="initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Your App Name" />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/path/to/your-icon.png"
        />
        {/* More icons can be added for different resolutions */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
