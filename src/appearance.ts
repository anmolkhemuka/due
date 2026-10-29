export type Theme='calm'|'pop';
export const themeKey='due-appearance';
export function readTheme(storage:Pick<Storage,'getItem'>):Theme{
 try{return storage.getItem(themeKey)==='pop'?'pop':'calm'}catch{return 'calm'}
}
export function applyTheme(theme:Theme){
 document.documentElement.dataset.theme=theme;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='pop'?'#F8FAFF':'#FCFCF8');
}
