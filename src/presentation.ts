/** Display colors only: never writes to saved card configuration. */
export function cardTileColor(bank:string,color?:string):string{
 if(color&&!['#6c5bd2','#7255f7','#7152ef'].includes(color.toLowerCase()))return color;
 const colors:Record<string,string>={hdfc:'#487dd7',icici:'#e97948',axis:'#bc5a8e',sbi:'#279fc0',idfcfirst:'#9b60ba',au:'#ca9844',yes:'#437bd2',onecard:'#6873c9',indusind:'#cb8059',pnb:'#c45d65',slice:'#9465ca',hsbc:'#da6664',amex:'#419889'};
 return colors[bank.toLowerCase().replace(/[^a-z]/g,'').replace(/bank$/,'')]||'#648b35';
}
