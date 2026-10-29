import 'fake-indexeddb/auto';
import {describe,it,expect} from 'vitest';
import {ensureDashboard,latestBills} from './latestBills';
import {ensure,stamp,type Data,type Card,type Bill} from './model';
// Entirely synthetic fixtures. No account-specific schedules are part of this repository.
function fixture():Data{
 const cards:Card[]=[11,20,27].map((day,i)=>({id:`test-${i}`,bank:'Example Bank',name:`Test Card ${i}`,last4:'',statementDay:null,dueDay:day,dueRule:'provisional',archived:false,color:'#7152ef',notes:'',...stamp()}));
 const bill=(c:Card,due:string):Bill=>({id:`${c.id}:${due}`,cardId:c.id,cycleId:`observed:${due}`,statementDate:null,dueDate:due,dateKind:'actual',source:'handwritten-schedule-2026',amountDue:null,status:'unknown',paidAt:null,amountPaid:null,reference:'',cardLabel:`Example ${c.name}`,...stamp()});
 return {schema:1,cards,bills:[bill(cards[0],'2032-04-11'),bill(cards[0],'2032-05-11'),bill(cards[1],'2032-04-20'),bill(cards[1],'2032-05-20'),bill(cards[2],'2032-04-27')]};
}
describe('latest payment dates checklist',()=>{
 it('shows one latest supplied date per card across months',()=>{const d=ensureDashboard(fixture(),'2032-04-25');const b=latestBills(d,'2032-04-25');expect(b).toHaveLength(3);expect(b.map(x=>x.dueDate)).toEqual(['2032-05-11','2032-04-20','2032-04-27'])});
 it('does not delete or modify history',()=>{const d=fixture(),before=JSON.stringify(d);latestBills(d,'2032-04-25');expect(JSON.stringify(d)).toBe(before);const next=ensureDashboard(d,'2032-04-25');for(const b of d.bills)expect(next.bills.find(x=>x.id===b.id)).toEqual(b)});
 it('keeps the latest paid record checked',()=>{const d=fixture();d.bills[1].status='paid';d.bills[1].paidAt='2032-05-10T12:00:00Z';expect(latestBills(d,'2032-04-25')[0]).toEqual(d.bills[1])});
 it('ignores distant estimates when an actual current bill exists',()=>{const d=ensure(ensureDashboard(fixture(),'2032-04-25'),'2035-01');expect(latestBills(d,'2032-04-25')[0].dueDate).toBe('2032-05-11')});
 it('keeps explicitly unpaid balances ahead of estimates',()=>{const d=ensureDashboard(fixture(),'2032-06-01');d.bills[1].status='unpaid';d.bills[1].amountDue=200;expect(latestBills(d,'2032-06-01')[0]).toEqual(d.bills[1])});
 it('uses a fresh reminder in the next month without carrying paid status forward',()=>{const d=ensureDashboard(fixture(),'2032-06-01');d.bills[1].status='paid';const b=latestBills(d,'2032-06-01')[0];expect(b.dueDate).toBe('2032-06-11');expect(b.status).toBe('unknown');expect(d.bills[1].status).toBe('paid')});
 it('excludes archived and deleted cards',()=>{const d=fixture();d.cards[0].archived=true;d.cards[1].deleted=true;expect(latestBills(d,'2032-04-25')).toHaveLength(1)});
 it('preserves corrected due dates after repeated preparation',()=>{const d=fixture();d.bills[1].dueDate='2032-05-12';const next=ensureDashboard(ensureDashboard(d,'2032-04-25'),'2032-04-25');expect(latestBills(next,'2032-04-25')[0].dueDate).toBe('2032-05-12');expect(latestBills(next,'2032-04-25')).toHaveLength(3)});
});

it('hides future confirmed dates too, including previously promoted estimates',()=>{const d=fixture();expect(latestBills(d,'2032-04-25').some(b=>b.dueDate>'2032-05-19')).toBe(false)});
it('opens the next cycle exactly 24 days before due, preserving paid history',()=>{let d=fixture();d.bills[1].status='paid';d=ensureDashboard(d,'2032-05-17');expect(latestBills(d,'2032-05-17')[0].id).toBe(d.bills[1].id);expect(latestBills(d,'2032-05-18')[0]).toMatchObject({dueDate:'2032-06-11',status:'unknown'});expect(d.bills[1].status).toBe('paid')});
