import {stamp,type Data,type Card,type Bill} from './model';
export function nextReminder(data:Data,cardId:string,on:string):Bill|undefined{
 const open=data.bills.filter(b=>b.cardId===cardId&&!b.deleted&&b.status!=='paid');
 return open.filter(b=>b.dueDate>=on).sort((a,b)=>a.dueDate.localeCompare(b.dueDate))[0]||open.sort((a,b)=>b.dueDate.localeCompare(a.dueDate))[0];
}
export function saveReminder(data:Data,card:Card,due:string,billId?:string):Data{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(due)||new Date(due+'T12:00:00Z').toISOString().slice(0,10)!==due)throw Error('Enter a valid payment due date');
 const existing=billId?data.bills.find(b=>b.id===billId&&b.cardId===card.id&&!b.deleted):data.bills.find(b=>b.cardId===card.id&&b.dueDate===due&&!b.deleted);
 const c={...card,dueDay:Number(due.slice(8)),dueRule:'provisional' as const,recurringStart:card.recurringStart||due.slice(0,7),...stamp()};
 const b:Bill=existing?(existing.dueDate===due?existing:{...existing,dueDate:due,dateKind:'actual',...stamp()}):{id:`${card.id}:manual:${due}`,cardId:card.id,cycleId:`manual:${due}`,statementDate:null,dueDate:due,dateKind:'actual',source:'manual',amountDue:null,status:'unknown',paidAt:null,amountPaid:null,reference:'',cardLabel:`${card.bank} ${card.name}${card.last4?' • '+card.last4:''}`.trim(),...stamp()};
 return {...data,cards:data.cards.some(x=>x.id===c.id)?data.cards.map(x=>x.id===c.id?c:x):[...data.cards,c],bills:existing?data.bills.map(x=>x.id===b.id?b:x):[...data.bills,b]};
}

/** Card appearance edits must never touch bill dates or payment records. */
export function saveCardDetails(data:Data,card:Card):Data{
 return {...data,cards:data.cards.map(c=>c.id===card.id?{...card,...stamp()}:c)};
}
