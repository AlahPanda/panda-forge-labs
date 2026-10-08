import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { useAdminText } from './adminText';

const files = [
  { path:'src/content/modpacks.json', key:'modpacks' },
  { path:'src/content/faq.json', key:'categories' }, { path:'src/content/reviews.json', key:'reviews' },
  { path:'src/content/site.json', key:'site' },
] as const;

/** Historical inventory only; no legacy write path is mounted in the owner panel. */
export default function LegacyArchive() {
  const a = useAdminText();
  const [items, setItems] = useState<Array<{ path:string; count:number | null; sha:string }>>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.allSettled(files.map(async ({path,key}) => {
      const file = await adminApi.read(path);
      const data = JSON.parse(file.content) as Record<string,unknown>;
      return {path,count:Array.isArray(data[key]) ? data[key].length : key === 'site' && data[key] ? 1 : null,sha:file.sha};
    })).then((results) => {
      if (!active) return;
      setItems(results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []));
      if (results.some((result) => result.status === 'rejected')) setError(a('loadError'));
    });
    return () => { active = false; };
  }, [a]);
  return <section className="admin-panel"><h2>{a('legacy')}</h2><p>{a('legacyWarning')}</p>{error && <p role="alert">{error}</p>}<div className="admin-table-wrap"><table><thead><tr><th>{a('content')}</th><th>{a('overviewCount')}</th><th>Git SHA</th></tr></thead><tbody>{items.map((item) => <tr key={item.path}><td>{item.path}</td><td>{item.count ?? a('unknown')}</td><td><code>{item.sha.slice(0,10)}</code></td></tr>)}</tbody></table></div></section>;
}
