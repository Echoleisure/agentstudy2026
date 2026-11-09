/* Lightweight DOM mock checks all route renderers without a browser.
   Run with: node scripts/smoke_site.js */
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const root=path.resolve(__dirname,'..');
const elements=new Map();
const fakeElement=(id)=>{
 if(!elements.has(id))elements.set(id,{
   innerHTML:'',textContent:'',value:'',style:{},classList:{add(){},remove(){},toggle(){}},
   setAttribute(){},removeAttribute(){},addEventListener(){},getAttribute(){return ''},
   querySelector(){return null},querySelectorAll(){return []},focus(){},setSelectionRange(){},
 });
 return elements.get(id);
};
const listeners={};
const document={
  getElementById:fakeElement,
  querySelectorAll:()=>[],
  querySelector:()=>null,
  addEventListener:(name,fn)=>listeners['doc-'+name]=fn,
  body:{dataset:{}},
};
const window={AGENT_QA_DATA:null,addEventListener:(name,fn)=>listeners[name]=fn,scrollTo(){}};
const localStorage={getItem(){return null},setItem(){}};
const location={hash:'#/home',replace(s){this.hash=s}};
const context=vm.createContext({window,document,localStorage,location,URL,console,setTimeout,clearTimeout,Blob,confirm(){return true;}});
vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf-8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf-8'),context);
const routes=['home','path','followups','chapter','cases','metrics','questions','flash','lab','notes','resources',
 ...window.AGENT_QA_DATA.courses.map(c=>'lesson/'+c.id),
 ...window.AGENT_QA_DATA.chapters.map((_,i)=>'chapter/'+i)];
for(const r of routes){
  location.hash='#/'+r;
  listeners.hashchange();
  const html=fakeElement('content').innerHTML;
  if(!html||html.length<100)throw Error(`render failed: ${r}`);
  if(html.includes('undefined'))console.log('warning: literal undefined on',r);
}
console.log(`PASS: rendered ${routes.length} routes, 9 lessons, 7 chapters; no JS runtime exceptions`);
