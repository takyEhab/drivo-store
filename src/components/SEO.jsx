import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, image, url, type = "website" }) {
  const siteName = "Drivo — Style Your Ride";
  const defaultDescription = "Drivo — Style Your Ride. Affordable, stylish car accessories in Egypt. Cash on Delivery. Order tracking. Interior, exterior and electronics upgrades.";
  const defaultImage = "/favicon.png";

  const seoTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* OpenGraph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
}
