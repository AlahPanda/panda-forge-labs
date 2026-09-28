import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@/lib/i18n';
import { adminApi } from '@/lib/adminApi';
import { localizeItem, localizationStatus } from '@/content/v2/localize';
import { parseCollection, parseItem, type FAQV2 } from '@/content/v2/schema';
import faqPublished from '@/content/v2/faq.json';
import { reviewProposal } from '@/pages/admin/proposals';
import AIStudio from '@/pages/admin/AIStudio';
import V2Workspace from '@/pages/admin/V2Workspace';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('V2 owner control', () => {
  it('localizes keyed FAQ answers and steps field by field, never by position', () => {
    const group = parseItem('faq', { slug:'general', name:'General', sourceLocale:'en', items:[{id:'account', question:'An account?',answer:'Official answer'},{id:'other',question:'Another?',answer:'Original'}], translations:{ 'pt-PT': {state:'partial',fields:{name:'Geral'},structured:{items:{account:{question:'Uma conta?',answer:'Resposta oficial'}}} } } }) as FAQV2;
    const translated = localizeItem(group, 'pt-PT');
    expect(translated.items[0].question).toBe('Uma conta?');
    expect(translated.items[1].answer).toBe('Original');
    expect(localizationStatus(group, 'faq', 'pt-PT').status).toBe('partial');
    const needsReview = parseItem('faq', {...group, translations:{'pt-PT':{...group.translations['pt-PT'],state:'needs-review'}}}) as FAQV2;
    expect(localizeItem(needsReview,'pt-PT').items[0].question).toBe('An account?');
    expect(localizeItem(needsReview,'pt-PT',{includeNeedsReview:true}).items[0].question).toBe('Uma conta?');
    expect(() => parseCollection('faq',{schemaVersion:2,items:[needsReview]})).toThrow(/private draft/);
  });

  it('uses stable IDs for homepage sections and rejects duplicate IDs during Edge-compatible validation', () => {
    const home = parseItem('homepage',{slug:'home',name:'Homepage',sourceLocale:'en',sections:[{id:'intro',visible:true,title:'Discover'},{id:'news',visible:true,title:'News'}],translations:{es:{state:'complete',fields:{},structured:{sections:{intro:{title:'Descubrir'}}}}}});
    const visible = localizeItem(home,'es');
    expect((visible.sections as Array<{title:string}>).map((part) => part.title)).toEqual(['Descubrir','News']);
    expect(localizationStatus(home,'homepage','es')).toMatchObject({status:'partial',translated:1,total:3,percent:33});
    expect(() => parseCollection('homepage',{schemaVersion:2,items:[{...home,sections:[{id:'intro',visible:true},{id:'intro',visible:false}]}]})).toThrow(/Duplicate sections ID/);
    const empty = parseItem('settings',{slug:'site',name:'AlahPanda Labs'});
    expect(localizationStatus(empty,'settings','es')).toMatchObject({percent:null,status:'unavailable'});
  });

  it('serves the published V2 FAQ groups from the Git collection', () => {
    const groups = faqPublished.items.map((item) => parseItem('faq', item));
    expect(groups).toHaveLength(4);
    expect(groups[0].slug).toBe('general');
    expect((groups[0].items as Array<{id:string}>)[0].id).toBe('minecraft-account');
  });

  it('validates proposed content, shows field paths, and rejects accidental field loss', () => {
    const current = parseItem('articles', {slug:'existing', name:'A title',sourceLocale:'en',body:'Original',translations:{en:{state:'partial',fields:{summary:'A summary'}}}});
    const revised = reviewProposal('articles', {...current,body:'Revised',translations:{en:{state:'partial',fields:{summary:'Updated'}}}},current);
    expect(revised.changes.map((change) => change.field)).toEqual(['translations.en.fields.summary','body']);
    expect(() => reviewProposal('articles',{...current,slug:'changed'},current)).toThrow(/slug/);
    expect(() => reviewProposal('articles',{...current,translations:{}},current)).toThrow(/omits/);
    expect(() => reviewProposal('articles',{slug:'existing',name:'A title',body:1},current)).toThrow();
  });

  it('keeps AI actions inactive and saves a validated proposal only as a private draft', async () => {
    vi.spyOn(adminApi,'read').mockResolvedValue({sha:'base-sha',content:JSON.stringify({schemaVersion:2,items:[]})});
    vi.spyOn(adminApi,'draftList').mockResolvedValue({drafts:[]});
    const save = vi.spyOn(adminApi,'draftSave').mockResolvedValue({draft:{content:{},base_sha:'base-sha',revision:1}});
    const publish = vi.spyOn(adminApi,'draftPublish');
    render(<I18nProvider><MemoryRouter><AIStudio/></MemoryRouter></I18nProvider>);
    expect(screen.getByRole('button',{name:'Generate article'})).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Proposed item (Content V2 JSON)'),{target:{value:JSON.stringify({slug:'new-article',name:'A title',sourceLocale:'en',body:'Original draft'})}});
    fireEvent.click(screen.getByRole('button',{name:'Validate and compare'}));
    expect(await screen.findByText('Review changes: articles/new-article')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Save private draft'}));
    await waitFor(() => expect(save).toHaveBeenCalledWith('articles','new-article',expect.objectContaining({body:'Original draft'}),'base-sha',null));
    expect(publish).not.toHaveBeenCalled();
  });

  it('requires a saved private preview and the confirmed Preview branch before publishing', async () => {
    const item = parseItem('faq',{slug:'general',name:'General',sourceLocale:'en',items:[{id:'account',question:'A question?',answer:'An answer.'}]});
    vi.spyOn(adminApi,'read').mockResolvedValue({sha:'base-sha',content:JSON.stringify({schemaVersion:2,items:[item]})});
    vi.spyOn(adminApi,'draftList').mockResolvedValue({drafts:[{kind:'faq',slug:'general',revision:3,updated_at:'2026-09-27T12:00:00Z'}]});
    vi.spyOn(adminApi,'draftRead').mockResolvedValue({draft:{content:item,base_sha:'base-sha',revision:3}});
    const publish = vi.spyOn(adminApi,'draftPublish').mockResolvedValue({ok:true,sha:'next-sha',url:'https://github.com/AlahPanda/panda-forge-labs/commit/next',branch:'v2/full-redesign'});
    vi.spyOn(window,'confirm').mockReturnValue(true);
    const view = render(<I18nProvider><MemoryRouter initialEntries={['/admin/editor/faq?entry=general']}><V2Workspace kind="faq"/></MemoryRouter></I18nProvider>);
    expect(await screen.findByRole('heading',{name:'General'})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Publish to Git'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button',{name:'Preview'}));
    expect(screen.getByRole('button',{name:'Publish to Git'})).toBeDisabled();
    view.rerender(<I18nProvider><MemoryRouter initialEntries={['/admin/editor/faq?entry=general']}><V2Workspace kind="faq" publishAllowed/></MemoryRouter></I18nProvider>);
    expect(screen.getByRole('button',{name:'Publish to Git'})).toBeEnabled();
    fireEvent.click(screen.getByRole('button',{name:'Publish to Git'}));
    await waitFor(() => expect(publish).toHaveBeenCalledWith('faq','general',3));
  });

  it('keeps unreviewed translation proposals private even after a preview', async () => {
    const item = parseItem('faq',{slug:'general',name:'General',sourceLocale:'en',items:[{id:'account',question:'An account?',answer:'Official answer'}],translations:{es:{state:'needs-review',fields:{},structured:{items:{account:{answer:'Pendiente'}}}}}});
    vi.spyOn(adminApi,'read').mockResolvedValue({sha:'base-sha',content:JSON.stringify({schemaVersion:2,items:[]})});
    vi.spyOn(adminApi,'draftList').mockResolvedValue({drafts:[{kind:'faq',slug:'general',revision:2,updated_at:'2026-09-27T12:00:00Z'}]});
    vi.spyOn(adminApi,'draftRead').mockResolvedValue({draft:{content:item,base_sha:'base-sha',revision:2}});
    const publish = vi.spyOn(adminApi,'draftPublish');
    render(<I18nProvider><MemoryRouter initialEntries={['/admin/editor/faq?entry=general']}><V2Workspace kind="faq" publishAllowed/></MemoryRouter></I18nProvider>);
    expect(await screen.findByRole('heading',{name:'General'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Preview'}));
    expect(screen.getByRole('button',{name:'Publish to Git'})).toBeDisabled();
    expect(screen.getByText(/Review the translation and set its state/)).toBeInTheDocument();
    expect(publish).not.toHaveBeenCalled();
  });
});
