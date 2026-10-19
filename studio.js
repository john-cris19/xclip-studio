(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const config = window.XCLIP_CONFIG || {apiBaseUrl:''};
  const languages = window.XCLIP_TRANSLATIONS || {};
  let video=$('preview');let currentSource=null,srcBlob=null,exporting=false,cancelled=false;
  let activeTweet=null,formats=[];
  let directGifBusy=false;
  const PIX='152a48f8-adeb-49b9-9999-0b3d7cff6e14';
  const themeButton=$('theme-toggle');
  function setTheme(mode) {
    const selected=mode==='light'?'light':'dark';
    document.documentElement.dataset.theme=selected;
    themeButton?.setAttribute('aria-pressed',String(selected==='dark'));
    const glyph=themeButton?.querySelector('span');if(glyph)glyph.textContent=selected==='dark'?'☀':'☾';
    const label=$('theme-label');if(label)label.textContent=selected==='dark'?'Claro':'Escuro';
    try{localStorage.setItem('xclip-theme',selected)}catch{}
  }
  let savedTheme='dark';
  try{savedTheme=localStorage.getItem('xclip-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}catch{savedTheme=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}
  setTheme(savedTheme);
  themeButton?.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

  const validateApi=()=>typeof config.apiBaseUrl==='string'&&/^https:\/\/[a-zA-Z0-9.-]+\/?$/.test(config.apiBaseUrl);
  const apiBase=()=>String(config.apiBaseUrl||'').replace(/\/$/,'');
  function t(key){return languages[$('lang').value]?.[key]||languages.pt_BR?.[key]||key;}
  function setLang(code){
    if(!languages[code])code='pt_BR';$('lang').value=code;document.documentElement.lang=code.replace('_','-');document.documentElement.dir=code==='ar'?'rtl':'ltr';
    for(const el of document.querySelectorAll('[data-i18n]')){
      const value=t(el.dataset.i18n);
      if(el.dataset.i18n==='headline')el.innerHTML=value;else el.textContent=value;
    }
  }
  $('copy-pix-site')?.addEventListener('click',async()=>{
    const btn=$('copy-pix-site');try{await navigator.clipboard.writeText(PIX);btn.textContent='Chave Pix copiada ✓';}catch{btn.textContent='Selecione a chave e copie';}
  });
  $('lang').addEventListener('change',()=>setLang($('lang').value));
  const locale=(navigator.language||'pt').toLowerCase();setLang(locale.startsWith('pt')?'pt_BR':locale.startsWith('zh')?'zh_CN':locale.startsWith('ar')?'ar':locale.startsWith('es')?'es':locale.startsWith('fr')?'fr':'en');
  function linkStatus(s,kind=''){ $('linkStatus').textContent=s;$('linkStatus').className='inline-state '+kind;}
  function editorStatus(s,kind=''){ $('editorStatus').textContent=s;$('editorStatus').className='help '+kind; }
  function safeTweetLink(str){try{const u=new URL(str);const hosts=['x.com','www.x.com','twitter.com','www.twitter.com','mobile.twitter.com'];return u.protocol==='https:'&&hosts.includes(u.hostname)&&/\/(?:i\/web\/)?status\/\d{8,25}(?:\/|$)/.test(u.pathname);}catch{return false;}}
  function safeMp4(str){try{const u=new URL(str);return u.protocol==='https:'&&u.hostname==='video.twimg.com'&&u.pathname.toLowerCase().endsWith('.mp4');}catch{return false;}}
  async function getJson(url){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),16000);try{const r=await fetch(url,{signal:controller.signal});const data=await r.json();if(!r.ok)throw Error(data.error||`HTTP ${r.status}`);return data;}finally{clearTimeout(timeout);}}
  $('resolve').addEventListener('click',async()=>{
    const raw=$('postUrl').value.trim();$('resolved').hidden=true;activeTweet=null;formats=[];
    if(safeMp4(raw)){
      // A direct MP4 URL may be available if its server permits browser CORS.
      linkStatus(t('loading'));try{const response=await fetch(raw);if(!response.ok)throw Error('HTTP '+response.status);const blob=await response.blob();await loadBlob(blob,'XClip_video.mp4');linkStatus(t('ready'),'success');}catch(e){linkStatus(t('error')+' '+e.message,'error');}return;
    }
    if(!safeTweetLink(raw)){linkStatus(t('badUrl'),'error');return;}
    if(!validateApi()){linkStatus(t('noApi'),'error');return;}
    $('resolve').disabled=true;linkStatus(t('loading'));
    try{const data=await getJson(`${apiBase()}/api/resolve?url=${encodeURIComponent(raw)}`);
      if(!Array.isArray(data.formats)||!data.formats.length)throw Error(t('noFormats'));
      formats=data.formats;activeTweet=data.tweetId;const select=$('quality');select.replaceChildren();for(const f of formats){const opt=document.createElement('option');opt.value=f.id;opt.textContent=f.label;select.append(opt);} $('resolved').hidden=false;linkStatus(data.notice||t('ready'),'success');
    }catch(e){linkStatus(t('error')+' Tente outro post público com MP4, ou selecione um vídeo do aparelho. '+(e.message||''),'error');}finally{$('resolve').disabled=false;}
  });
  const videoUrl=()=>`${apiBase()}/api/video?tweet=${encodeURIComponent(activeTweet)}&q=${encodeURIComponent($('quality').value)}`;
  $('downloadDirect').addEventListener('click',()=>{
    if(!activeTweet||!validateApi())return;
    const a=document.createElement('a');a.href=videoUrl()+'&download=1';a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove();
  });
  $('openEditor').addEventListener('click',async()=>{if(!activeTweet||!validateApi())return;const button=$('openEditor');button.disabled=true;linkStatus(t('loading'));try{const r=await fetch(videoUrl());if(!r.ok)throw Error(`HTTP ${r.status}`);const b=await r.blob();if(b.size>150_000_000)throw Error('Arquivo muito grande');await loadBlob(b,`XClip_${activeTweet}_${$('quality').selectedOptions[0]?.textContent||'video'}.mp4`);linkStatus(t('ready'),'success');$('editorPanel').scrollIntoView({behavior:'smooth',block:'start'});}catch(e){linkStatus(t('error')+' '+e.message,'error');}finally{button.disabled=false;}});
  async function quickGif(which,fromPost=false){
    if(exporting||directGifBusy)return;
    directGifBusy=true;
    try {
      if(fromPost){
        if(!activeTweet||!validateApi())throw Error('Selecione uma publicação com MP4 antes.');
        const response=await fetch(videoUrl());if(!response.ok)throw Error('Não foi possível obter o MP4 desta publicação.');
        const media=await response.blob();if(!media.size||media.size>150_000_000)throw Error('Vídeo muito grande ou indisponível.');
        await loadBlob(media,'XClip_'+activeTweet+'_'+($('quality').selectedOptions[0]?.textContent||'video')+'.mp4');
        $('editorPanel').scrollIntoView({behavior:'smooth',block:'start'});
      }
      if(!$('preview').src)throw Error('Selecione um vídeo antes.');
      $('exportType').value='gif';$('exportType').dispatchEvent(new Event('change'));
      $('whole').checked=which==='full';$('start').value='0';$('end').value=String(which==='full'?video.duration:Math.min(video.duration,8));syncTrim();
      $('fps').value='6';$('size').value='320';
      if(which==='full'&&video.duration>90&&!confirm('Um GIF completo com mais de 90 segundos pode demorar e ficar grande. Deseja continuar?'))return;
      $('export').click();
    }catch(error){editorStatus(error.message,'error');linkStatus(error.message,'error');}
    finally{directGifBusy=false;}
  }
  $('gifShortDirect').addEventListener('click',()=>void quickGif('short',true));
  $('gifFullDirect').addEventListener('click',()=>void quickGif('full',true));
  $('gif8Local').addEventListener('click',()=>void quickGif('short'));
  $('gifFullLocal').addEventListener('click',()=>void quickGif('full'));
  $('file').addEventListener('change',async()=>{const file=$('file').files?.[0];if(!file)return;try{await loadBlob(file,file.name);$('editorPanel').scrollIntoView({behavior:'smooth',block:'start'});}catch(e){editorStatus(t('error')+' '+e.message,'error');}});
  function waitEvent(el,name,ms=14000){return new Promise((res,rej)=>{const timer=setTimeout(()=>{clean();rej(Error('Video timeout'));},ms);function clean(){clearTimeout(timer);el.removeEventListener(name,onSuccess);el.removeEventListener('error',onError);}function onSuccess(){clean();res();}function onError(){clean();rej(Error('Video decoding error'));}el.addEventListener(name,onSuccess,{once:true});el.addEventListener('error',onError,{once:true});});}
  async function loadBlob(blob,name){if(!blob.size)throw Error('Empty file');if(srcBlob)URL.revokeObjectURL(srcBlob);srcBlob=URL.createObjectURL(blob);currentSource={name,size:blob.size};video.src=srcBlob;video.load();await waitEvent(video,'loadedmetadata');const dur=Number(video.duration);if(!(dur>.05)||!video.videoWidth)throw Error('Invalid video');$('noVideo').hidden=true;video.style.display='block';$('export').disabled=false;
    $('start-slider').max=String(dur);$('end-slider').max=String(dur);$('end').value=String(Math.round(dur*10)/10);$('end').max=String(dur);$('start').max=String(Math.max(0,dur-.1));$('whole').checked=true;syncTrim();$('gif8Local').disabled=false;$('gifFullLocal').disabled=false;$('videoMeta').textContent=`${name} · ${video.videoWidth}×${video.videoHeight} · ${Math.ceil(dur)}s · ${(blob.size/1048576).toFixed(1)} MB`;editorStatus(t('ready'),'success');}
  function ts(sec){const v=Math.floor(Math.max(0,Number(sec)||0));return `${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`;}
  function syncTrim(which){
    const total=Number(video.duration)||0;const whole=$('whole').checked;
    $('trim-shell').hidden=whole || !total;
    for(const id of ['start','end'])$(id).disabled=whole;
    if(!total)return;
    let a=Math.max(0,Math.min(Number($('start').value)||0,total-.1));
    let b=Math.max(a+.1,Math.min(Number($('end').value)||total,total));
    if(which==='start')a=Math.min(a,b-.1);
    if(which==='end')b=Math.max(b,a+.1);
    $('start').value=String(Math.round(a*10)/10);$('end').value=String(Math.round(b*10)/10);
    $('start-slider').value=String(a);$('end-slider').value=String(b);
    $('trim-rail').style.setProperty('--a',`${a/total*100}%`);
    $('trim-rail').style.setProperty('--b',`${b/total*100}%`);
    $('trim-duration').textContent=`${ts(a)} – ${ts(b)}`;
    $('total-time').textContent=ts(total);
  }
  $('whole').addEventListener('change',()=>syncTrim());
  for (const id of ['start','end']) $(id).addEventListener('input',()=>syncTrim(id));
  for(const [id,target] of [['start-slider','start'],['end-slider','end']]){
    $(id).addEventListener('input',()=>{
      const value=Number($(id).value), other=Number($(target==='start'?'end':'start').value);
      $(target).value=String(target==='start'?Math.min(value,other-.1):Math.max(value,other+.1));
      $('whole').checked=false;syncTrim(target);video.currentTime=Math.max(0,Math.min(video.duration-.02,Number($(target).value)));
    });
  }

  $('exportType').addEventListener('change',()=>{const gif=$('exportType').value==='gif';$('fpsWrap').style.display=gif?'block':'none';document.querySelector('.audio-control').style.display=gif?'none':'flex';});
  $('exportType').dispatchEvent(new Event('change'));
  function range(){const total=video.duration||0;const start=$('whole').checked?0:Number($('start').value),end=$('whole').checked?total:Number($('end').value);if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end>total+.01||end-start<.1)throw Error(t('badRange'));return {start,end};}
  function region(){const srcW=video.videoWidth,srcH=video.videoHeight;let x=0,y=0,w=srcW,h=srcH;
    const ratio=$('crop').value;if(ratio!=='original'){const [a,b]=ratio.split(':').map(Number),r=a/b;if(w/h>r){w=Math.floor(h*r);x=Math.floor((srcW-w)/2);}else{h=Math.floor(w/r);y=Math.floor((srcH-h)/2);}}
    const max=$('size').value==='original'?Math.max(w,h):Number($('size').value);const scale=Math.min(1,max/Math.max(w,h));return {x,y,w,h,outW:Math.max(2,Math.floor((w*scale)/2)*2),outH:Math.max(2,Math.floor((h*scale)/2)*2)};
  }
  function paint(context,r){context.drawImage(video,r.x,r.y,r.w,r.h,0,0,r.outW,r.outH);}
  async function seek(time){if(cancelled)throw Error(t('cancelled'));const v=Math.max(.005,Math.min(video.duration-.02,time));if(Math.abs(video.currentTime-v)<.004&&video.readyState>=2)return;const waiter=waitEvent(video,'seeked');video.currentTime=v;await waiter;}
  function stem(){const name=currentSource?.name || 'XClip_video';return name.replace(/\.[a-zA-Z0-9]{1,7}$/,'').replace(/[^\p{L}\p{N}._-]/gu,'_').slice(0,88)||'XClip_video';}
  function save(blob,name){const link=URL.createObjectURL(blob);const a=document.createElement('a');a.href=link;a.download=name.replace(/[^\p{L}\p{N}._-]/gu,'_');a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(link),90000);}
  async function gifExport(rg,r){const requestedFps=Number($('fps').value)||6;
    const seconds=rg.end-rg.start;
    const frames=Math.max(1,Math.min(400,Math.ceil(seconds*requestedFps),Math.floor(115_000_000/(r.outW*r.outH))));
    const fps=frames/seconds;
    if(frames<2)throw Error(t('oversize'));
    if(fps<requestedFps)editorStatus('GIF completo: amostrando '+frames+' quadros em '+Math.round(seconds)+' s.');
    const canvas=document.createElement('canvas');canvas.width=r.outW;canvas.height=r.outH;const context=canvas.getContext('2d',{willReadFrequently:true});const gif=new XClipGif.GifWriter(r.outW,r.outH);
    for(let i=0;i<frames;i++){if(cancelled)throw Error(t('cancelled'));await seek(rg.start+i/fps);paint(context,r);gif.addFrame(XClipGif.indexedPixels(context.getImageData(0,0,r.outW,r.outH).data),100/fps);$('progress').value=Math.round(100*(i+1)/frames);editorStatus(`${t('working')} ${i+1}/${frames}`);await new Promise(res=>setTimeout(res,0));}
    const result=gif.finish();save(result,`${stem()}_${Math.round(rg.start*10)}-${Math.round(rg.end*10)}s.gif`);editorStatus(t('done'),'success');
  }
  function recordingOptions(audio){if(typeof MediaRecorder==='undefined')return [];const candidates=audio?['video/mp4;codecs="avc1.42E01E,mp4a.40.2"','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']:['video/mp4;codecs="avc1.42E01E"','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];return candidates.filter(m=>MediaRecorder.isTypeSupported(m));}
  async function videoExport(rg,r){if(typeof MediaRecorder==='undefined'||typeof HTMLCanvasElement.prototype.captureStream!=='function')throw Error('Video encoding not supported in this browser.');
    const canvas=document.createElement('canvas');canvas.width=r.outW;canvas.height=r.outH;const ctx=canvas.getContext('2d');const stream=canvas.captureStream(30);
    let audioCtx=null,audioSource=null,audioDest=null,recorder=null,stop=false,frame=0,started=false;
    try{
      await seek(rg.start);let hasAudio=false;
      if($('keepAudio').checked&&(window.AudioContext||window.webkitAudioContext)){
        try{const A=window.AudioContext||window.webkitAudioContext;audioCtx=new A();audioSource=audioCtx.createMediaElementSource(video);audioDest=audioCtx.createMediaStreamDestination();audioSource.connect(audioDest);await audioCtx.resume();const track=audioDest.stream.getAudioTracks()[0];if(track){stream.addTrack(track);hasAudio=true;}}catch(e){console.warn('Audio unavailable:',e);}}
      const choices=recordingOptions(hasAudio);for(const mime of choices){try{recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:1800000});break;}catch(_) {}}
      if(!recorder)throw Error('Video codec not supported');const chunks=[];
      const finished=new Promise((resolve,reject)=>{recorder.addEventListener('dataavailable',e=>{if(e.data?.size)chunks.push(e.data);});recorder.addEventListener('stop',resolve,{once:true});recorder.addEventListener('error',e=>reject(e.error||Error('Recording error')),{once:true});});
      const stopRecorder=()=>{if(stop)return;stop=true;cancelAnimationFrame(frame);video.pause();if(recorder.state!=='inactive')recorder.stop();};
      paint(ctx,r);recorder.start(300);started=true;await video.play();
      await new Promise((resolve,reject)=>{const startedAt=performance.now();const tick=()=>{if(cancelled){stopRecorder();resolve();return;}if(video.error){stopRecorder();reject(Error('Playback error'));return;}try{paint(ctx,r);}catch(e){stopRecorder();reject(e);return;}
        const pct=Math.round(Math.min(100,(video.currentTime-rg.start)/(rg.end-rg.start)*100));$('progress').value=Math.max(0,pct);editorStatus(`${t('working')} ${Math.max(0,pct)}%`);
        if(video.currentTime>=rg.end-.035||video.ended){stopRecorder();resolve();return;}if(performance.now()-startedAt>(rg.end-rg.start)*4500+25000){stopRecorder();reject(Error('Encoding timeout'));return;}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);});
      await finished;if(cancelled)throw Error(t('cancelled'));const type=recorder.mimeType;const ext=type.includes('mp4')?'mp4':'webm';const blob=new Blob(chunks,{type});if(!blob.size)throw Error('Empty encoded video');save(blob,`${stem()}_${Math.round(rg.start*10)}-${Math.round(rg.end*10)}s_edit.${ext}`);editorStatus(t('done'),'success');
    }finally{cancelAnimationFrame(frame);video.pause();if(started&&recorder?.state!=='inactive')try{recorder.stop();}catch{}for(const track of stream.getTracks())track.stop();if(audioSource)try{audioSource.disconnect();}catch{}if(audioDest)try{audioDest.disconnect();}catch{}if(audioCtx)try{await audioCtx.close();}catch{}
      if(audioSource){const replacement=document.createElement('video');replacement.id='preview';replacement.controls=true;replacement.playsInline=true;replacement.preload='metadata';replacement.style.display='block';replacement.src=srcBlob;video.replaceWith(replacement);video=replacement;}
    }
  }
  // Editor audio uses one MediaElementAudioSourceNode per video element.
  // Replacing the element after recording allows the next export to create a new source.
  let getActiveVideo=()=>document.getElementById('preview');
  $('export').addEventListener('click',async()=>{
    if(exporting)return;const v=getActiveVideo();if(!v.src){editorStatus(t('noVideo'),'error');return;}
    let rg,r;try{rg=range();r=region();}catch(e){editorStatus(e.message,'error');return;}
    exporting=true;cancelled=false;$('export').disabled=true;$('progress').hidden=false;$('progress').value=0;$('cancel').hidden=false;const old=v.currentTime;v.pause();
    try{if($('exportType').value==='gif')await gifExport(rg,r);else await videoExport(rg,r);}
    catch(e){editorStatus(e.message||t('error'),'error');}
    finally{exporting=false;$('export').disabled=false;$('progress').hidden=true;$('cancel').hidden=true;try{getActiveVideo().currentTime=Math.min(Math.max(0,old),getActiveVideo().duration-.04);}catch{}}
  });
  $('cancel').addEventListener('click',()=>{cancelled=true;});
  window.addEventListener('pagehide',()=>{if(srcBlob)URL.revokeObjectURL(srcBlob);});
})();
