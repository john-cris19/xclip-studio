/* XClip Safe Media: format identification only; NOT an antivirus. */
(()=>{'use strict';
const allowed={video:['video/mp4','video/webm'],image:['image/png','image/jpeg','image/webp','image/gif']};
const string=(bytes,a,b)=>String.fromCharCode(...bytes.slice(a,b));
function type(bytes){
 if(bytes.length>=12&&string(bytes,4,8)==='ftyp'&&/^(isom|iso[2-9]|mp4[12]|avc1|M4V |M4A |dash|qt  |MSNV)/.test(string(bytes,8,12)))return 'video/mp4';
 if(bytes.length>=4&&[26,69,223,163].every((v,i)=>bytes[i]===v))return 'video/webm';
 if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
 if(bytes.length>=6&&['GIF89a','GIF87a'].includes(string(bytes,0,6)))return 'image/gif';
 if(bytes.length>=12&&string(bytes,0,4)==='RIFF'&&string(bytes,8,12)==='WEBP')return 'image/webp';
 if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 return null;
}
async function verify(blob,kind='video'){
 if(!(blob instanceof Blob)||!blob.size)throw Error('Arquivo vazio.');
 if(blob.size>(kind==='image'?32:150)*1048576)throw Error('Arquivo excede o limite de segurança.');
 const bytes=new Uint8Array(await blob.slice(0,32).arrayBuffer()),actual=type(bytes);
 if(!allowed[kind]?.includes(actual))throw Error('Assinatura do arquivo incompatível: não parece mídia '+kind+'.');
 return actual;
}
globalThis.XClipSafe=Object.freeze({verify,type});})();
