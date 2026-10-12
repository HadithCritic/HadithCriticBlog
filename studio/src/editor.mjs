import { Editor, Node, Mark } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { parse, parseDocument } from 'yaml';
import { registry } from './registry.mjs';
import { emptyDocument, prose, plainText, validateDocument } from './model.mjs';
export const parseYaml = value => parse(value, { maxAliasCount: 0 });
export function patchYamlField(block,key,value,{omitEmpty=false}={}) {
  const doc=parseDocument(block);if(doc.errors.length)throw new Error('Fix invalid frontmatter in source before editing metadata.');
  const pair=doc.contents?.items.find(item=>item.key?.value===key);
  const empty=omitEmpty&&(value===''||value==null);
  if(!pair)return empty?block:`${block}${block.endsWith('\n')?'':'\n'}${key}: ${JSON.stringify(value)}`;
  const start=pair.key.range[0],end=pair.value?.range[2]??pair.key.range[2];
  const prefix=block.slice(0,start),suffix=block.slice(end);
  const hadNewline=block.slice(start,end).endsWith('\n');
  const eol=block.slice(start,end).endsWith('\r\n')?'\r\n':'\n';
  return prefix+(empty?'':`${key}: ${JSON.stringify(value)}${hadNewline?eol:''}`)+suffix;
}

const NOTE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const Footnote = Node.create({
  name: 'footnote', group: 'inline', inline: true, atom: true,
  addAttributes: () => ({ id: { default: '' } }),
  parseHTML: () => [{ tag: 'sup[data-footnote]' }],
  renderHTML: ({ node }) => ['sup', { 'data-footnote': node.attrs.id, class: 'fn-chip', title: `Footnote ${node.attrs.id}` }, node.attrs.id]
});
const Arabic = Mark.create({ name:'arabic', parseHTML:() => [{tag:'span[lang="ar"]'}], renderHTML:() => ['span',{lang:'ar',dir:'rtl'},0] });
const Superscript = Mark.create({ name:'superscript', parseHTML:() => [{tag:'sup:not([data-footnote])'}], renderHTML:() => ['sup',{},0] });
const clone = value => JSON.parse(JSON.stringify(value));
const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
const button = (text, action, className = 'button button--quiet') => { const node = el('button',text,className); node.type='button'; node.onclick=action; return node; };
const LIST_KINDS = ['facts','bibliography','strings','rows','nodes','edges','branches'];
const arraySchemas = {
  facts: { value:'text',label:'text' }, bibliography:{author:'text',title:'text',details:'text',year:'text'},
  nodes:{id:'text',label:'text',sublabel:'text',x:'number',y:'number',kind:['normal','root','cl','pcl','collector','ghost'],labelPos:['right','left','above','below']},
  edges:{from:'text',to:'text',kind:['normal','trunk','dive']},
  branches:{name:'text',from:'text',arabic:'text',quote:'text',sources:'text',marks:'strings'}
};
// Interface wording only. Prop names and stored values are never renamed.
const LABELS = {
  label:'Label', title:'Title', arabic:'Arabic', translation:'Translation', isnad:'Isnād', source:'Source citation', url:'Source link',
  verse:'Verse reference', reference:'Reference', eyebrow:'Eyebrow', author:'Author', sourceUrl:'Source link', inline:'Inline',
  facts:'Facts', status:'Status', collapsible:'Collapsible', kind:'Kind', entries:'Entries', caption:'Caption',
  stickyFirstCol:'Keep first column in view', columns:'Columns', rows:'Rows', nodes:'Nodes', edges:'Edges',
  ariaLabel:'Accessible description', width:'Width', height:'Height', legend:'Show legend', orientation:'Orientation',
  root:'Root', bottleneck:'Bottleneck', branches:'Branches', channel:'Channel', date:'Date', value:'Value', details:'Details',
  year:'Year', id:'ID', x:'x', y:'y', sublabel:'Sublabel', labelPos:'Label position', from:'From', to:'To', quote:'Quote',
  sources:'Sources', marks:'Marks', name:'Name', src:'Image path', alt:'Alt text'
};
const HINTS = { verse:'For example 2:255 or 4:11-12', ariaLabel:'Read aloud in place of the figure', alt:'Describe what the image shows' };
export const BLOCK_GROUPS = [
  ['Writing', [['Prose','Text section'],['QuoteBlock','Quotation'],['Arabic','Arabic passage'],['ContextNote','Context note'],['ClaimBox','Claim box'],['VerdictBox','Verdict box']]],
  ['Sources', [['HadithBlock','Hadith report'],['QuranPassage','Qurʾān passage'],['QuranVerse','Qurʾān verse (reference)'],['BibleVerse','Bible verse'],['Source','Source extract'],['Bibliography','Bibliography']]],
  ['Figures', [['SourceComparisonTable','Comparison table'],['IsnadDiagram','Isnād diagram'],['VariantTree','Variant tree']]],
  ['Media', [['YouTubeEmbed','YouTube video']]]
];
const BLOCK_NAMES = Object.fromEntries(BLOCK_GROUPS.flatMap(([,items]) => items));
export const blockName = block => block.kind === 'image' ? 'Image' : block.kind === 'prose' ? 'Text section' : BLOCK_NAMES[block.type] || block.type;

export function createVisualEditor(host, onChange, { outline: outlineHost = null, onRequestImage = null } = {}) {
  let doc = emptyDocument(), editors = [], past = [], future = [], beforeTyping, focus = null, pendingFocus = null;
  const remember = () => { past.push(clone(doc)); if(past.length>100) past.shift(); future=[]; };
  const changed = () => { onChange(clone(doc)); updateOutline(); };
  const mutate = fn => { remember(); fn(); render(); changed(); };
  const typeChange = fn => { if (!beforeTyping) { remember(); beforeTyping=true; setTimeout(()=>beforeTyping=false,800); } fn(); changed(); };

  function updateOutline() {
    if (!outlineHost) return;
    outlineHost.replaceChildren();
    doc.blocks.forEach((block,index) => {
      if (block.kind === 'prose') {
        for (const node of block.content.content || []) if (node.type === 'heading') {
          const link = el('a', plainText(node) || 'Untitled heading', `outline__h${node.attrs.level}`); link.href=`#studio-block-${index}`; outlineHost.append(link);
        }
      } else {
        const link = el('a', blockName(block), 'outline__block'); link.href=`#studio-block-${index}`; outlineHost.append(link);
      }
    });
    outlineHost.closest('[hidden]')?.removeAttribute('hidden');
  }

  /** New blocks land after the block being worked on, splitting text at the cursor. */
  function insertBlock(block) {
    let at = doc.blocks.length;
    if (focus && focus.index < doc.blocks.length) {
      at = focus.index + 1;
      const current = doc.blocks[focus.index];
      if (current.kind === 'prose' && focus.editor && !focus.editor.isDestroyed) {
        const nodes = focus.editor.getJSON().content || [];
        const cursor = focus.editor.state.selection.$from.index(0);
        const before = nodes.slice(0, cursor + 1), after = nodes.slice(cursor + 1);
        const isEmpty = node => node?.type === 'paragraph' && !node.content?.length;
        if (isEmpty(before.at(-1)) && before.length > 1) before.pop();
        if (after.length) {
          current.content = { type:'doc', content:before };
          doc.blocks.splice(at, 0, block, { kind:'prose', content:{ type:'doc', content:after } });
          pendingFocus = at;
          return;
        }
      }
    }
    doc.blocks.splice(at, 0, block);
    pendingFocus = at;
  }

  function nextNoteId() {
    const used = new Set(doc.notes.map(note => note.id.toLowerCase()));
    let n = doc.notes.length + 1;
    while (used.has(`n${n}`)) n++;
    return `n${n}`;
  }
  function addFootnote(editor, id) {
    if (!editor || !NOTE_ID.test(id)) return false;
    remember();
    const isNew = !doc.notes.some(note => note.id === id);
    // A new note starts empty, so no placeholder wording can reach the article.
    if (isNew) doc.notes.push({ id, content: prose() });
    editor.chain().focus().insertContent({ type:'footnote', attrs:{ id } }).run();
    render(); changed();
    if (isNew) host.querySelector(`[data-note-id="${CSS.escape(id)}"] .tiptap`)?.focus();
    return true;
  }

  function rich(container, content, set, { inNote = false, index = null } = {}) {
    const wrap=el('div',undefined,'rich');
    const toolbar=el('div',undefined,'rich__toolbar');
    const canvas=el('div',undefined,'rich-canvas');
    wrap.append(toolbar,canvas); container.append(wrap);
    const heading=el('select'); heading.setAttribute('aria-label','Paragraph or heading');
    ['Paragraph','Heading 2','Heading 3','Heading 4','Heading 5','Heading 6'].forEach((label,i)=>{const option=el('option',label);option.value=String(i ? i+1 : 0);heading.append(option);});
    const editor=new Editor({ element:canvas,injectCSS:false,extensions:[StarterKit.configure({heading:{levels:[2,3,4,5,6]},codeBlock:false,strike:false,underline:false,link:{openOnClick:false},trailingNode:false}),Footnote,Arabic,Superscript],content,
      onFocus:()=>{ focus = inNote ? null : { index, editor }; },
      onSelectionUpdate:()=>{ const level=editor.getAttributes('heading').level; heading.value=String(editor.isActive('heading')?level:0); },
      onUpdate:()=>typeChange(()=>set(editor.getJSON())) });
    editors.push(editor);
    heading.onchange=()=>Number(heading.value) ? editor.chain().focus().toggleHeading({level:Number(heading.value)}).run() : editor.chain().focus().setParagraph().run();
    toolbar.append(heading);
    const commands = [
      ['Bold',()=>editor.chain().focus().toggleBold().run()], ['Italic',()=>editor.chain().focus().toggleItalic().run()],
      ['Arabic RTL',()=>editor.chain().focus().toggleMark('arabic').run()], ['Superscript',()=>editor.chain().focus().toggleMark('superscript').run()],
      ['Code',()=>editor.chain().focus().toggleCode().run()], ['Link',()=>{
        const value=prompt('Link URL (HTTPS or site path)',editor.getAttributes('link').href||'https://');
        if(value) editor.chain().focus().setLink({href:value}).run();
      }],
      ['Quote',()=>editor.chain().focus().toggleBlockquote().run()], ['Bullets',()=>editor.chain().focus().toggleBulletList().run()],
      ['Numbered',()=>editor.chain().focus().toggleOrderedList().run()], ['Rule',()=>editor.chain().focus().setHorizontalRule().run()]
    ];
    for (const [label,action] of commands) toolbar.append(button(label,action,'tool'));
    if (!inNote) toolbar.append(button('Footnote',()=>addFootnote(editor,nextNoteId()),'tool tool--accent'));
  }

  function field(container,key,kind,value,set,{ required = false } = {}) {
    const label=el('label',undefined,'field');
    const caption=el('span',LABELS[key] || key);
    if (required) { const mark = el('small','required'); mark.setAttribute('aria-hidden','true'); caption.append(mark); }
    else if (HINTS[key]) caption.append(el('small',HINTS[key]));
    label.append(caption);
    let input;
    if (kind==='boolean') { label.classList.add('field--check'); input=el('input');input.type='checkbox';input.checked=!!value;input.onchange=()=>typeChange(()=>set(input.checked)); }
    else if(Array.isArray(kind)) {
      input=el('select');kind.forEach(item=>{const opt=el('option',item);input.append(opt);});input.value=value||kind[0];input.onchange=()=>typeChange(()=>set(input.value));
    } else {
      const long = ['arabic','translation','quote','isnad','caption'].includes(key);
      input=el(kind==='number' || !long ? 'input' : 'textarea');
      if(kind==='number') input.type='number'; else if (long) input.rows=key==='arabic'?3:4;
      input.value=value??'';
      if(key==='arabic') { input.lang='ar';input.dir='rtl';label.classList.add('field--arabic'); }
      else if (long) label.classList.add('field--prose');
      input.oninput=()=>typeChange(()=>set(kind==='number'?Number(input.value):input.value));
      input.required = required;
    }
    if (kind === 'boolean') label.prepend(input); else label.append(input);
    container.append(label);
  }

  function arrayControl(container,key,kind,values,set) {
    const section=el('fieldset',undefined,`array array--${kind}`);section.append(el('legend',LABELS[key] || key));
    values.forEach((value,index)=>{
      const row=el('div',undefined,'array-row');
      if(kind==='strings') field(row,`${LABELS[key] || key} ${index+1}`,'text',value,v=>{values[index]=v;set(values);});
      else if(kind==='rows') value.forEach((cell,col)=>field(row,`Column ${col+1}`,'text',cell,v=>{values[index][col]=v;set(values);}));
      else for (const [name,type] of Object.entries(arraySchemas[kind])) {
        if(type==='strings') arrayControl(row,name,type,value[name]||[],v=>{value[name]=v;set(values);});
        else field(row,name,type,value[name],v=>{value[name]=v;set(values);});
      }
      row.append(button('Remove row',()=>mutate(()=>{
        if(key==='columns')doc.blocks.find(block=>block.props?.columns===values)?.props.rows.forEach(row=>row.splice(index,1));
        values.splice(index,1);set(values);
      }),'tool tool--danger'));section.append(row);
    });
    section.append(button('Add row',()=>mutate(()=>{
      const value=kind==='strings'?'':kind==='rows'?Array.from({length:doc.blocks.find(b=>b.props?.rows===values)?.props.columns.length||1},()=> ''):Object.fromEntries(Object.entries(arraySchemas[kind]).filter(([,type])=>!Array.isArray(type)).map(([name,type])=>[name,type==='number'?0:type==='strings'?[]:'']));
      if(key==='columns')doc.blocks.find(block=>block.props?.columns===values)?.props.rows.forEach(row=>row.push(''));
      values.push(value);set(values);
    }),'tool'));
    container.append(section);
  }

  function insertBar() {
    const bar=el('div',undefined,'insert-bar');
    const history=el('div',undefined,'insert-bar__group');
    history.append(button('Undo',()=>{if(past.length){future.push(clone(doc));doc=past.pop();render();changed();}},'tool'),button('Redo',()=>{if(future.length){past.push(clone(doc));doc=future.pop();render();changed();}},'tool'));
    const select=el('select');select.setAttribute('aria-label','Block type');
    for (const [group,items] of BLOCK_GROUPS) {
      const optgroup=el('optgroup');optgroup.label=group;
      for (const [value,label] of items) { const option=el('option',label);option.value=value;optgroup.append(option); }
      select.append(optgroup);
    }
    const insert=button('Insert block',()=>mutate(()=>{
      const type=select.value;
      if(type==='Prose') return insertBlock({kind:'prose',content:prose()});
      const props={};
      for(const [key,kind] of Object.entries(registry[type].fields)) {
        if(LIST_KINDS.includes(kind)) props[key]=[];
        else if(registry[type].required.includes(key)) props[key]=kind==='kind'?'hadith':'';
      }
      if(type==='Arabic')props.inline=true;
      if(type==='IsnadDiagram'){props.legend=true;props.orientation='top-down';}
      if(type==='SourceComparisonTable') props.columns=['Source','Wording'];
      insertBlock({kind:'component',type,props,...(registry[type].children?{content:prose()}: {})});
    }),'button button--primary button--small');
    const add=el('div',undefined,'insert-bar__group insert-bar__add');
    add.append(select,insert);
    if (onRequestImage) add.append(button('Image…',onRequestImage,'tool'));
    bar.append(add,history);
    return bar;
  }

  function render() {
    editors.forEach(editor=>editor.destroy());editors=[]; focus=null;
    host.replaceChildren(insertBar());
    if (!doc.blocks.length) host.append(el('p','Choose a block type and insert it to begin. Text sections hold headings, paragraphs, quotations and lists.','visual-empty'));
    doc.blocks.forEach((block,index)=>{
      const section=el('section',undefined,`visual-block visual-block--${block.kind}`);section.id=`studio-block-${index}`;
      section.addEventListener('focusin',()=>{ if(!focus || focus.index!==index) focus={index,editor:null}; });
      const header=el('header',undefined,'visual-block__head');
      header.append(el('strong',blockName(block)));
      const actions=el('div',undefined,'visual-block__actions');
      actions.append(button('Move up',()=>{if(index)mutate(()=>[doc.blocks[index-1],doc.blocks[index]]=[doc.blocks[index],doc.blocks[index-1]]);},'tool'),button('Move down',()=>{if(index<doc.blocks.length-1)mutate(()=>[doc.blocks[index+1],doc.blocks[index]]=[doc.blocks[index],doc.blocks[index+1]]);},'tool'),button('Delete block',()=>mutate(()=>doc.blocks.splice(index,1)),'tool tool--danger'));
      header.append(actions);section.append(header);
      const body=el('div',undefined,'visual-block__body');section.append(body);
      if(block.kind==='image') {
        const figure=el('figure',undefined,'visual-image');
        const preview=el('img');preview.alt=block.alt;const id=block.src.match(/\/images\/studio\/([a-f0-9-]{36})\./)?.[1];if(id)preview.src=`/api/media/${id}`;
        figure.append(preview);body.append(figure);
        for(const key of ['alt','caption']) field(body,key,'text',block[key],value=>block[key]=value,{required:key==='alt'});
        body.append(el('p',block.src,'visual-image__path'));
      }
      if(block.kind==='component') {
        const grid=el('div',undefined,'field-grid');
        for (const [key,kind] of Object.entries(registry[block.type].fields)) {
          if(LIST_KINDS.includes(kind)) arrayControl(body,key,kind,block.props[key]||[],value=>block.props[key]=value);
          else field(['arabic','translation','isnad','quote','caption'].includes(key)?body:grid,key,kind==='kind'?['hadith','quran','bible']:kind==='orientation'?['top-down','bottom-up']:kind,block.props[key],value=>{
            if(value==='') delete block.props[key]; else block.props[key]=value;
          },{required:registry[block.type].required.includes(key)});
        }
        if (grid.childElementCount) body.prepend(grid);
      }
      if(block.content) rich(body,block.content,value=>block.content=value,{index});
      host.append(section);
    });
    const notes=el('section',undefined,'visual-notes');
    const head=el('header',undefined,'visual-block__head');head.append(el('strong',`Footnotes${doc.notes.length?` · ${doc.notes.length}`:''}`));notes.append(head);
    if (!doc.notes.length) notes.append(el('p','Use Footnote in any text toolbar to add a numbered note at the cursor.','visual-empty'));
    for(const note of doc.notes) {
      const item=el('section',undefined,'note');item.dataset.noteId=note.id;
      const noteHead=el('header',undefined,'note__head');noteHead.append(el('span',note.id,'fn-chip'),button('Delete definition',()=>mutate(()=>doc.notes.splice(doc.notes.indexOf(note),1)),'tool tool--danger'));
      item.append(noteHead);
      rich(item,note.content,value=>note.content=value,{inNote:true});notes.append(item);
    }
    const reuse=el('div',undefined,'note-reuse');
    const newId=el('input');newId.placeholder='Note ID, e.g. ibn-sad';newId.setAttribute('aria-label','New footnote ID');
    reuse.append(el('span','Custom or repeated note','note-reuse__label'),newId,button('Insert footnote at cursor',()=>{
      const target = focus?.editor && !focus.editor.isDestroyed ? focus.editor : null;
      if(!addFootnote(target,newId.value)) alert('Place the cursor in a text section, then enter a note ID using letters, numbers, hyphens or underscores. An existing ID adds another reference to that note.');
    },'tool'));
    notes.append(reuse);
    host.append(notes);updateOutline();
    if (pendingFocus !== null) {
      const target = host.querySelector(`#studio-block-${pendingFocus}`);pendingFocus=null;
      target?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      target?.querySelector('input,textarea,select,.tiptap')?.focus({preventScroll:true});
    }
  }
  return {
    load(value){doc=clone(value);past=[];future=[];render();},
    document(){return clone(doc);},
    validate(){return validateDocument(doc);},
    insertImage(image){mutate(()=>insertBlock({kind:'image',src:image.path,alt:image.alt,caption:'',...(image.variants?.length?{variants:image.variants}: {})}));},
    destroy(){editors.forEach(editor=>editor.destroy());editors=[];host.replaceChildren();}
  };
}
