import 'fake-indexeddb/auto';
import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {ReminderEditor} from './ReminderEditor';
import {stamp,type Card,type Data} from './model';
const card:Card={id:'test',bank:'Example',name:'Test',last4:'',statementDay:null,dueDay:3,dueRule:'provisional',archived:false,color:'#7152ef',notes:'',...stamp()};
const data:Data={schema:1,cards:[card],bills:[]};
describe('separate card and bill editing',()=>{
 it('keeps payment dates out of card editing',()=>{const html=renderToStaticMarkup(<ReminderEditor data={data} card={card} onSave={()=>{}}/>);expect(html).not.toContain('name="dueDate"');expect(html).toContain('Save card');expect(html).toContain('name="color"')});
 it('asks for the first payment date when adding a card',()=>{const html=renderToStaticMarkup(<ReminderEditor data={data} card={null} onSave={()=>{}}/>);expect(html).toContain('name="dueDate"');expect(html).toContain('24 days')});
});
