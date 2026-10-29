import {describe,it,expect} from 'vitest';
import {readTheme,themeKey} from './appearance';
describe('device appearance preference',()=>{
 it('defaults to calm for new or unrecognised preferences',()=>{for(const value of [null,'dark','invalid',''])expect(readTheme({getItem:()=>value})).toBe('calm')});
 it('restores Pop from its own storage key',()=>{expect(readTheme({getItem:key=>key===themeKey?'pop':null})).toBe('pop')});
 it('keeps the app usable when storage is unavailable',()=>{expect(readTheme({getItem:()=>{throw Error('Storage disabled')}})).toBe('calm')});
});
