import { site } from '@/lib/config';

export function Footer() {
  return <footer id="footer" className="site-footer"><small>© {new Date().getUTCFullYear()} {site.brand}</small></footer>;
}
