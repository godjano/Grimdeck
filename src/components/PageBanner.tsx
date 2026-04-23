import GoldIcon from './GoldIcon';

const b = import.meta.env.BASE_URL;

// Banner images mapped by page title for unique visuals
const BANNER_MAP: Record<string, string> = {
  'My Models': 'banners/models-banner.png',
  'The Pile of Grey': 'banners/grey-pile-banner.png',
  'Paint Rack': 'banners/paint-rack-banner.png',
  'Progress': 'banners/challenges-banner.png',
  'Solo Campaigns': 'banners/campaign-banner.png',
  'Campaigns': 'banners/campaign-banner.png',
  'Battle Log': 'banners/battle-log-banner.png',
  'Community': 'banners/community-banner.png',
  'Shelf of Pride': 'banners/showcase-banner.png',
  'Showcase': 'banners/showcase-banner.png',
  'Painting Challenges': 'banners/challenges-banner.png',
  'Hobby Stats': 'banners/tools-banner.png',
  'Settings & Backup': 'banners/hero-workshop.png',
  'Settings': 'banners/hero-workshop.png',
  'Tools': 'banners/tools-banner.png',
  'Data Manager': 'banners/hero-workshop.png',
  'Paint Guides': 'banners/paint-rack-banner.png',
  'Inspiration & Reference': 'banners/hero-workshop.png',
  'Inspiration': 'banners/hero-workshop.png',
  'Army List': 'banners/models-banner.png',
  'Wishlist': 'banners/showcase-banner.png',
};

export default function PageBanner({ title, subtitle, icon, image }: { title: string; subtitle?: string; icon?: string; image?: string }) {
  const bannerSrc = image ? `${b}${image}` : (BANNER_MAP[title] ? `${b}${BANNER_MAP[title]}` : `${b}banner-cathedral.jpg`);
  return (
    <div className="page-banner">
      <img src={bannerSrc} alt="" className="page-banner-bg" loading="lazy" />
      <div className="page-banner-overlay" />
      <div className="page-banner-content">
        {icon && <GoldIcon name={icon} size={36} />}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}
