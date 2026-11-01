import Dexie,{type Table} from 'dexie';
export type RecordBase={id:string;updatedAt:string;op:string;deleted?:boolean};
export type Card=RecordBase & {bank:string;name:string;last4:string;statementDay:number|null;dueDay:number;dueRule?:'fixed'|'last-day'|'provisional';recurringConfirmed?:boolean;cycleChanged?:boolean;requiresConfirmation?:boolean;importKey?:string;recurringStart?:string;color:string;notes:string;archived:boolean;sample?:boolean};
export type Bill=RecordBase & {cardId:string;cycleId:string;statementDate:string|null;dueDate:string;dateKind?:'actual'|'estimated'|'tentative';source?:string;amountDue:number|null;status:'paid'|'unpaid'|'unknown';paidAt:string|null;amountPaid:number|null;reference:string;cardLabel:string;sample?:boolean};
export type Data={schema:1;cards:Card[];bills:Bill[]};
export const stamp=()=>({updatedAt:new Date().toISOString(),op:crypto.randomUUID()});
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const date=(y:number,m:number,d:number)=>`${y}-${String(m+1).padStart(2,'0')}-${String(Math.min(d,new Date(y,m+1,0).getDate())).padStart(2,'0')}`;
export function cycle(card:Card,y:number,m:number):Bill {const statementDate=date(y,m,card.statementDay??1);const offset=card.dueDay<=(card.statementDay??1)?1:0;const due=new Date(y,m+offset,1);const cycleId=statementDate.slice(0,7);return {id:`${card.id}:${cycleId}`,cardId:card.id,cycleId,statementDate,dueDate:date(due.getFullYear(),due.getMonth(),card.dueDay),amountDue:null,status:'unpaid',paidAt:null,amountPaid:null,reference:'',cardLabel:`${card.bank} ${card.name} • ${card.last4}`,...stamp()};}
export function ensure(data:Data,month:string,refreshEstimates=false):Data {
 const [y,m]=month.split('-').map(Number);const bills=[...data.bills];
 for(const c of data.cards.filter(c=>!c.archived&&!c.deleted)){
  if(c.dueRule||c.statementDay===null){
   if(c.recurringStart&&month<c.recurringStart)continue;
   // Unconfirmed, untouched generated estimates follow the current card rule after
   // date corrections/sync. Actual dates, balances and payment history never move.
   const expected=date(y,m-1,c.dueRule==='last-day'?31:c.dueDay);
   for(let i=0;i<bills.length;i++){const b=bills[i];if(refreshEstimates&&!b.deleted&&b.cardId===c.id&&b.dueDate.slice(0,7)===month&&b.dateKind==='estimated'&&b.source==='recurring-rule'&&b.status==='unknown'&&b.amountDue===null&&b.amountPaid===null&&b.paidAt===null&&!b.reference&&b.dueDate!==expected)bills[i]={...b,dueDate:expected,...stamp()};}

   if(bills.some(b=>!b.deleted&&b.cardId===c.id&&b.dueDate.slice(0,7)===month))continue;
   const baseId=`${c.id}:expected:${month}`;let id=baseId;let suffix=1;
   // A corrected date may have moved this ID into another month. Keep its history
   // and allocate a new reminder identity; explicit deletion still suppresses it.
   while(bills.some(b=>b.id===id&&!b.deleted))id=`${baseId}:replacement:${suffix++}`;
   if(bills.some(b=>b.id===id&&b.deleted))continue;
   bills.push({id,cardId:c.id,cycleId:`expected:${month}`,statementDate:null,dueDate:date(y,m-1,c.dueRule==='last-day'?31:c.dueDay),dateKind:'estimated',source:'recurring-rule',amountDue:null,status:'unknown',paidAt:null,amountPaid:null,reference:'',cardLabel:`${c.bank} ${c.name}${c.last4?' • '+c.last4:''}`,...stamp()});
  }else for(let offset=-1;offset<=0;offset++){const d=new Date(y,m-1+offset,1);const b=cycle(c,d.getFullYear(),d.getMonth());if(!bills.some(x=>x.id===b.id))bills.push(b);}
 }
 return {...data,bills};
}
export function merge(a:Data,b:Data):Data {if(b.schema!==1)throw Error('Unsupported backup version');const combine=<T extends RecordBase>(x:T[],y:T[])=>{const map=new Map(x.map(r=>[r.id,r]));for(const r of y){const old=map.get(r.id);if(!old||r.updatedAt>old.updatedAt||(r.updatedAt===old.updatedAt&&r.op>old.op))map.set(r.id,r);}return [...map.values()]};return {schema:1,cards:combine(a.cards,b.cards),bills:combine(a.bills,b.bills)};}
export function conflicts(a:Data,b:Data):boolean {return ([...a.cards,...a.bills]).some(r=>{const other=[...b.cards,...b.bills].find(x=>x.id===r.id);return other&&other.op!==r.op&&JSON.stringify(other)!==JSON.stringify(r)});}
class Store extends Dexie {state!:Table<{id:string;data:Data}>;constructor(){super('due-credit-v1');this.version(1).stores({state:'id'});}}
export const db=new Store();export const save=(data:Data)=>db.state.put({id:'main',data});
export function demo():Data {const month=today().slice(0,7);const [y,m]=month.split('-').map(Number);const defs=[['HDFC','Infinia','4281',8,26,'#264b76',24500],['AXIS','Atlas','9016',12,30,'#87394f',18420],['SBI','Cashback','3029',14,31,'#237b9e',6380],['ICICI','Amazon Pay','8502',2,20,'#bc6033',3299],['HSBC','Live+','1947',5,23,'#ac4449',8750],['IDFC FIRST','Wealth','6673',10,28,'#8b435d',null],['HDFC','Tata Neu Infinity','0518',15,31,'#654d8c',1240],['AMEX','Membership Rewards','1008',1,18,'#537a73',15780]];const cards:Card[]=defs.map(d=>({id:crypto.randomUUID(),bank:String(d[0]),name:String(d[1]),last4:String(d[2]),statementDay:Number(d[3]),dueDay:Number(d[4]),color:String(d[5]),notes:'',archived:false,sample:true,...stamp()}));return {schema:1,cards,bills:cards.map((c,i)=>({...cycle(c,y,m-1),amountDue:defs[i][6] as number|null,status:i===3||i===4||i===7?'paid':'unpaid',paidAt:i===3||i===4||i===7?`${month}-18T06:30:00.000Z`:null,sample:true}))};}
export function validate(raw:unknown):Data {const d=raw as Data;if(d?.schema!==1||!Array.isArray(d.cards)||!Array.isArray(d.bills))throw Error('Invalid Due backup');for(const r of [...d.cards,...d.bills])if(typeof r.id!=='string'||typeof r.updatedAt!=='string'||typeof r.op!=='string')throw Error('Invalid backup records');for(const c of d.cards)if(typeof c.bank!=='string'||typeof c.name!=='string'||!(c.last4===''||/^\d{4}$/.test(c.last4))||(c.statementDay!==null&&(c.statementDay<1||c.statementDay>31))||c.dueDay<1||c.dueDay>31)throw Error('Invalid card');for(const b of d.bills)if(!/^\d{4}-\d{2}-\d{2}$/.test(b.dueDate)||!['paid','unpaid','unknown'].includes(b.status)||!(b.amountDue===null||Number.isFinite(b.amountDue)))throw Error('Invalid bill');return d;}
export interface BillProvider {id:string;fetchBills(card:Card):Promise<Partial<Bill>[]>}export const manualProvider:BillProvider={id:'manual',async fetchBills(){return []}};
