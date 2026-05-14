import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://cookers-delight.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/icons/icon-512x512.png`;
const SITE_NAME = 'Cookers Delight';

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  schema?: object;
}

export default function SEOHead({ title, description, ogImage, canonical, schema }: SEOHeadProps) {
  const image = ogImage ?? DEFAULT_IMAGE;
  const url = canonical ?? SITE_URL;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}
