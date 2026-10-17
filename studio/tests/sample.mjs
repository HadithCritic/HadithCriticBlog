import { prose } from '../src/model.mjs';
export const path = 'src/content/articles/transmission-narrators/studio-example.mdx';
export const metadata = { title:'Synthetic Studio rendering fixture',description:'A test fixture, not research content.',date:'2026-10-12',category:'Transmission & Narrators',tags:['Testing'],draft:true };
// Every character a Markdown, GFM or MDX parser could read as syntax, in prose.
export const PUNCTUATION = '- 1. al-Zuhrī (d. 124/742): see www.example.org, https://example.org and a@b.org; #2 *x* _y_ [z] {w} <v> ~u~ | &amp; \\ = + > ! ^';
export function sample() {
  return {schema:1,blocks:[
    {kind:'prose',content:{type:'doc',content:[
      {type:'heading',attrs:{level:2},content:[{type:'text',text:'Authored evidence'}]},
      {type:'paragraph',content:[{type:'text',text:'ʿĀʾisha: إِنَّ — {literal} *markers* <script> & |',marks:[{type:'bold'}]},{type:'footnote',attrs:{id:'source-a'}},{type:'text',text:' and repeated '},{type:'footnote',attrs:{id:'source-a'}}]},
      {type:'paragraph',content:[{type:'text',text:PUNCTUATION}]},
      {type:'blockquote',content:[{type:'blockquote',content:[{type:'paragraph',content:[{type:'text',text:'Nested “exact quotation”'}]}]}]}
    ]}},
    {kind:'component',type:'HadithBlock',props:{label:'Synthetic report',translation:'Exact English quotation {braces}',arabic:'إِنَّ هَذَا نَصٌّ',isnad:'Author-supplied chain',source:'Exact citation, vol. 1, p. 2',url:'https://example.com/source'}},
    {kind:'component',type:'QuranPassage',props:{verse:'1:1',translation:'Authored test translation',arabic:'بِسْمِ اللَّهِ'}},
    {kind:'component',type:'SourceComparisonTable',props:{columns:['Witness','Wording'],rows:[['A | B','عِكْرِمَة {literal}'],['C','A\nsecond line']],caption:'Test comparison'}},
    {kind:'component',type:'QuoteBlock',props:{author:'Named test author',source:'Exact work'},content:prose('Exact prose quotation')},
    {kind:'component',type:'IsnadDiagram',props:{ariaLabel:'Synthetic transmission diagram',nodes:[{id:'a',x:50,y:50,label:'A'},{id:'b',x:100,y:100,label:'B'}],edges:[{from:'a',to:'b'}]}},
    {kind:'component',type:'VariantTree',props:{title:'Test variants',root:'A',bottleneck:'B',branches:[{name:'Variant one',quote:'Exact test wording',arabic:'نَصٌّ',sources:'Exact reference'}]}}
  ],notes:[{id:'source-a',content:prose('Exact citation: Author, Book, vol. 3, p. 4. إِنَّ')}]};
}
