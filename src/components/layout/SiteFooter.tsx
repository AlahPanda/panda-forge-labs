import { Link } from 'react-router-dom';
import { Compass, ExternalLink, Leaf, MessageCircle } from 'lucide-react';
import { BrandSymbol } from '@/components/design-system/BrandSymbol';
import { site } from '@/content';
import { useI18n } from '@/lib/i18n';
import { publicContactEmail, publicSettings } from '@/content/publicResolver';
import { siteLinks } from './SiteHeader';

export default function SiteFooter() {
  const { t } = useI18n();
  return <footer className="experience-footer">
    <div className="container experience-footer-main">
      <div className="experience-footer-intro"><Link to="/" className="experience-brand"><BrandSymbol className="experience-brand-symbol"/>{publicSettings()?.name || site.name}</Link><p>{t('footer.tagline')}</p><span className="experience-footer-ornament"><Compass size={49}/><Leaf size={25}/></span></div>
      <nav aria-label="Footer navigation"><h2>Explore</h2><div>{siteLinks.filter((link) => link.to !== '/').map((link) => <Link key={link.to} to={link.to}>{t(link.key)}</Link>)}</div></nav>
      <div><h2>Community</h2><a href={site.discordUrl} target="_blank" rel="noopener noreferrer">Discord <ExternalLink size={13}/></a><Link to="/support">Support</Link><a href={'mailto:' + publicContactEmail()}>{publicContactEmail()}</a></div>
      <div><h2>{t('footer.legal')}</h2><Link to="/legal?kind=privacy">{t('footer.privacy')}</Link><Link to="/legal?kind=terms">{t('footer.terms')}</Link><Link to="/admin" className="experience-admin-link">Admin</Link></div>
    </div>
    <div className="container experience-footer-bottom"><span>© {new Date().getFullYear()} AlahPanda Labs · {t('footer.rights')}</span><span>{site.tagline}</span></div>
  </footer>;
}
