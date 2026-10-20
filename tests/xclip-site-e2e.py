import pathlib, os, sys
from playwright.sync_api import sync_playwright
url = 'https://john-cris19.github.io/xclip-studio/'
post = 'https://x.com/jiyz022/status/2111795836464288080'
with sync_playwright() as pw:
    browser_args = dict(headless=True, args=['--no-sandbox','--disable-dev-shm-usage'])
    chrome='/usr/bin/google-chrome'
    if pathlib.Path(chrome).exists():
        browser_args['executable_path']=chrome
    browser=pw.chromium.launch(**browser_args)
    page=browser.new_page(accept_downloads=True)
    errors=[]
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.goto(url,wait_until='domcontentloaded',timeout=35000)
    # Security: website must load its format-verification module and expose reconstructed MP4 option.
    page.wait_for_function("() => !!window.XClipSafe && !!document.querySelector('#safeDownload')",timeout=20000)
    safety=page.evaluate("""async () => {
      const fake = new Blob(['<script>not video</script>'],{type:'video/mp4'});
      const good = new Blob([new Uint8Array([0,0,0,24,102,116,121,112,105,115,111,109,0,0,0,0])],{type:'video/mp4'});
      let blocked=false;try{await XClipSafe.verify(fake,'video')}catch{blocked=true}
      let accepted=false;try{accepted=(await XClipSafe.verify(good,'video'))==='video/mp4'}catch{}
      return {blocked,accepted};
    }""")
    print('XCLIP SAFE SIGNATURE CHECK:',safety,flush=True)
    assert safety['blocked'] and safety['accepted']
    page.locator('#postUrl').fill(post)
    page.locator('#resolve').click()
    try:
        page.locator('#resolved').wait_for(state='visible',timeout=25000)
    except Exception:
        print('RESOLVE MESSAGE:',page.locator('#linkStatus').inner_text(),flush=True)
        raise
    options=page.locator('#quality option').all_text_contents()
    print('PUBLIC RESOLVER OPTIONS:',options,flush=True)
    assert options
    with page.expect_download(timeout=80000) as dl:
        page.locator('#downloadDirect').click()
    mp4=dl.value
    mp4.save_as('/tmp/xclip-e2e.mp4')
    assert pathlib.Path('/tmp/xclip-e2e.mp4').read_bytes()[4:8]==b'ftyp'
    print('PUBLIC MP4 SUCCESS:',mp4.suggested_filename,pathlib.Path('/tmp/xclip-e2e.mp4').stat().st_size,flush=True)
    with page.expect_download(timeout=120000) as dl:
        page.locator('#gifShortDirect').click()
    gif=dl.value
    gif.save_as('/tmp/xclip-e2e.gif')
    assert pathlib.Path('/tmp/xclip-e2e.gif').read_bytes().startswith(b'GIF89a')
    print('PUBLIC GIF SUCCESS:',gif.suggested_filename,pathlib.Path('/tmp/xclip-e2e.gif').stat().st_size,flush=True)
    # The reconstructed MP4 feature is optional: do not pretend to sanitize when the codec is absent.
    safe_mp4_supported=page.evaluate("() => typeof MediaRecorder!=='undefined' && MediaRecorder.isTypeSupported('video/mp4;codecs=\\\"avc1.42E01E\\\"')")
    print('SAFE MP4 CODEC SUPPORTED:',safe_mp4_supported,flush=True)
    if safe_mp4_supported:
        # MP4 video codec support does not imply AAC support. Test video-only reconstruction first.
        page.locator('#keepAudio').uncheck()
        with page.expect_download(timeout=45000) as dl:
            page.locator('#safeDownload').click()
        cleaned=dl.value
        cleaned.save_as('/tmp/xclip-rebuilt.mp4')
        assert pathlib.Path('/tmp/xclip-rebuilt.mp4').read_bytes()[4:8]==b'ftyp'
        print('REBUILT MP4 SUCCESS:',cleaned.suggested_filename,pathlib.Path('/tmp/xclip-rebuilt.mp4').stat().st_size,flush=True)
    else:
        page.locator('#safeDownload').click()
        page.wait_for_function("() => document.querySelector('#linkStatus').textContent.includes('não oferece recodificação')",timeout=12000)
        print('REBUILT MP4 DISABLED CORRECTLY (NO CODEC)',flush=True)
    print('BROWSER ERRORS:',errors,flush=True)
    assert not errors
    browser.close()
