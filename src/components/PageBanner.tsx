import GoldIcon from './GoldIcon';

const b = import.meta.env.BASE_URL;

export default function PageBanner({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: string }) {
  return (
    <div className="page-banner">
      <img src={`${b}banner-cathedral.jpg`} alt="" className="page-banner-bg" loading="lazy" />
      <div className="page-banner-overlay" />
      <div className="page-banner-content">
        {icon && <GoldIcon name={icon} size={36} />}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}
