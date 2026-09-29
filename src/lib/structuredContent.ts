import type { ArticleV2, GuideV2 } from '@/content/v2/schema';

const absolute = (path: string, origin: string) => new URL(path, origin).href;
export function breadcrumbs(origin: string, segments: {name:string;path:string}[]) {
  return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:segments.map(({name,path},index) => ({'@type':'ListItem',position:index+1,name,item:absolute(path,origin)}))};
}
export function articleData(origin:string, article:ArticleV2, locale = article.sourceLocale) {
  const image=article.media?.find((media)=>media.kind==='image')?.url;
  return {'@context':'https://schema.org','@type':'Article',headline:article.name,description:article.summary,url:absolute('/news/'+article.slug,origin),mainEntityOfPage:absolute('/news/'+article.slug,origin),inLanguage:locale,datePublished:article.publishedAt,dateModified:article.modifiedAt || article.publishedAt,author:article.author ? {'@type':'Organization',name:article.author}:undefined,image:image?absolute(image,origin):undefined};
}
export function guideData(origin:string, guide:GuideV2, locale = guide.sourceLocale) {
  const image=guide.media?.find((media)=>media.kind==='image')?.url;
  return {'@context':'https://schema.org','@type':'TechArticle',headline:guide.name,description:guide.summary,url:absolute('/guides/'+guide.slug,origin),inLanguage:locale,dateModified:guide.updatedAt,image:image?absolute(image,origin):undefined};
}
