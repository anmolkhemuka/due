import {ensure,type Bill,type Data} from './model';
/** Prepare the current/next month without modifying any existing obligation. */
export function ensureDashboard(data:Data,on:string):Data{
 const [y,m]=on.slice(0,7).split('-').map(Number);const next=new Date(y,m,1);const nextMonth=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}`;
 return ensure(ensure(data,on.slice(0,7)),nextMonth);
}
/** One latest supplied date per card; complete history stays in Data.bills. */
export function latestBills(data:Data,on:string):Bill[]{
 const result:Bill[]=[];
 for(const c of data.cards.filter(c=>!c.deleted&&!c.archived)){
  const records=data.bills.filter(b=>!b.deleted&&b.cardId===c.id);
  const supplied=records.filter(b=>b.dateKind!=='estimated').sort((a,b)=>b.dueDate.localeCompare(a.dueDate)||b.updatedAt.localeCompare(a.updatedAt)||b.id.localeCompare(a.id));
  const estimates=records.filter(b=>b.dateKind==='estimated').sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||a.id.localeCompare(b.id));
  let latest=supplied[0];
  // A lone, unconfirmed historical import can advance to its next estimated reminder.
  // Explicitly unpaid balances stay visible; navigating far into History cannot hide them.
  if(!latest||(latest.dueDate<on&&((latest.status==='unknown'&&latest.source==='handwritten-schedule-2026')||(latest.status==='paid'&&latest.dueDate.slice(0,7)<on.slice(0,7))))){
   latest=estimates.find(b=>b.dueDate>=on)||latest||estimates[estimates.length-1];
  }
  if(latest)result.push(latest);
 }
 return result;
}
