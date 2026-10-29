import {ensure,type Bill,type Data} from './model';
/** Prepare the current/next month without modifying any existing obligation. */
export function ensureDashboard(data:Data,on:string):Data{
 const [y,m]=on.slice(0,7).split('-').map(Number);const next=new Date(y,m,1);const nextMonth=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}`;
 return ensure(ensure(data,on.slice(0,7)),nextMonth);
}
/** Show cycles only once their 24-day reminder window opens. History is untouched. */
export function latestBills(data:Data,on:string):Bill[]{
 const end=new Date(on+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+24);
 const through=end.toISOString().slice(0,10);
 const result:Bill[]=[];
 for(const c of data.cards.filter(c=>!c.deleted&&!c.archived)){
  const records=data.bills.filter(b=>!b.deleted&&b.cardId===c.id&&b.dueDate<=through);
  const supplied=records.filter(b=>b.dateKind!=='estimated').sort((a,b)=>b.dueDate.localeCompare(a.dueDate)||b.updatedAt.localeCompare(a.updatedAt)||b.id.localeCompare(a.id));
  const estimates=records.filter(b=>b.dateKind==='estimated').sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||a.id.localeCompare(b.id));
  let latest=supplied[0];
  // A paid cycle advances only when the next cycle's reminder window opens.
  // Explicit unpaid balances remain visible even when overdue.
  if(!latest||latest.status==='paid'||(latest.dueDate<on&&latest.status==='unknown'&&latest.source==='handwritten-schedule-2026')){
   latest=estimates.find(b=>b.dueDate>=on&&(!latest||b.dueDate>latest.dueDate))||latest;
  }
  if(latest)result.push(latest);
 }
 return result;
}
