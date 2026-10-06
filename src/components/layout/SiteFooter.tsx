import { Link } from 'react-router-dom';
import { Compass, ExternalLink, Leaf, MessageCircle } from 'lucide-react';
import { BrandSymbol } from '@/components/design-system/BrandSymbol';
import { site } from '@/content';
import { useI18n } from '@/lib/i18n';
import { publicContactEmail, publicSettings } from '@/content/publicResolver';
import { siteLinks } from './SiteHeader';
import { localizeItem } from '@/content/v2/localize';

export default function SiteFooter() {
  const { t, locale } = useI18n();
  const settings = publicSettings();
  return <footer className="experience-footer">
    <div className="container experience-footer-main">
      <div className="experience-footer-intro"><Link to="/" className="experience-brand"><BrandSymbol className="experience-brand-symbol"/>{settings ? localizeItem(settings, locale).name : site.name}</Link><p>{t('footer.tagline')}</p><span className="experience-footer-ornament"><Compass size={49}/><Leaf size={25}/></span></div>
      <nav aria-label={t('ui.footerNavigation')}><h2>{t('ui.exploreSection')}</h2><div>{siteLinks.filter((link) => link.to !== '/').map((link) => <Link key={link.to} to={link.to}>{t(link.key)}</Link>)}</div></nav>
      <div><h2>{t('ui.community')}</h2><a href={site.discordUrl} target="_blank" rel="noopener noreferrer">Discord <ExternalLink size={13}/></a><Link to="/support">{t('nav.support')}</Link><a href={'mailto:' + publicContactEmail()}>{publicContactEmail()}</a></div>
      <div><h2>{t('footer.legal')}</h2><Link to="/legal/privacy">{t('footer.privacy')}</Link><Link to="/legal/terms">{t('footer.terms')}</Link><Link to="/admin" className="experience-admin-link">{t('ui.ownerCms')}</Link></div>
    </div>
    <div className="container experience-footer-bottom"><span>© {new Date().getFullYear()} AlahPanda Labs · {t('footer.rights')}</span><span>{t('footer.tagline')}</span></div>
  </footer>;
}
