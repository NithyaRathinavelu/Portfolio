import { notFound } from 'next/navigation';
import ComingSoon from '@/components/ComingSoon';
import CaseStudy, { numberImages } from '@/components/CaseStudy';
import { projects } from '@/lib/content';
import conversational from '@/data/conversational-ai.json';
import designSystem from '@/data/design-system.json';
import esign from '@/data/esign-estamp.json';
import workflow from '@/data/workflow-builder.json';

const DATA = { 'conversational-ai': conversational, 'design-system': designSystem, 'esign-estamp': esign, 'workflow-builder': workflow };
const ORDER = ['conversational-ai', 'design-system', 'esign-estamp', 'workflow-builder'];

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const p = projects.find((x) => x.slug === params.slug);
  return { title: p ? `${p.title}: Nithya Rathinavelu` : 'Case study', description: p?.summary };
}

export default function Page({ params }) {
  const p = projects.find((x) => x.slug === params.slug);
  if (!p) notFound();
  const data = DATA[params.slug];
  if (!data) return <ComingSoon label={p.meta} title={p.title} text="This case study is being moved to the website and will be here soon." />;
  const copy = JSON.parse(JSON.stringify(data));
  numberImages(copy);
  const next = ORDER[(ORDER.indexOf(params.slug) + 1) % ORDER.length];
  const nextTitle = projects.find((x) => x.slug === next)?.title;
  return <CaseStudy data={copy} slug={params.slug} next={next} nextTitle={nextTitle} />;
}
