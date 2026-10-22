import pathlib
from playwright.sync_api import sync_playwright

BASE='https://john-cris19.github.io/xclip-studio/'
POST='https://x.com/jiyz022/status/2111795836464288080'
with sync_playwright() as pw:
    exe='/usr/bin/google-chrome'
    args=dict(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    if pathlib.Path(exe).exists():args['executable_path']=exe
    browser=pw.chromium.launch(**args)
    ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True,accept_downloads=True,user_agent='Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36')
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda err: errors.append(str(err)))
    page.goto(BASE,wait_until='domcontentloaded',timeout=35000)
    print('MOBILE VIEWPORT:',page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})'),flush=True)
    page.locator('#postUrl').fill(POST)
    page.locator('#resolve').click()
    page.locator('#resolved').wait_for(state='visible',timeout=30000)
    print('MOBILE QUALITIES:',page.locator('#quality option').all_text_contents(),flush=True)
    print('MOBILE DIRECT HREF:',page.locator('#downloadDirect').get_attribute('href'),flush=True)
    assert '/api/video?' in page.locator('#downloadDirect').get_attribute('href') and 'download=1' in page.locator('#downloadDirect').get_attribute('href')
    with page.expect_download(timeout=85000) as dl:
        page.locator('#downloadDirect').click()
    vid=dl.value;vid.save_as('/tmp/xclip-mobile.mp4')
    assert pathlib.Path('/tmp/xclip-mobile.mp4').read_bytes()[4:8]==b'ftyp'
    print('MOBILE MP4 PASS:',vid.suggested_filename,pathlib.Path('/tmp/xclip-mobile.mp4').stat().st_size,flush=True)
    page.locator('#gifShortDirect').click()
    page.locator('#mobile-save-panel').wait_for(state='visible',timeout=120000)
    print('MOBILE GIF READY:',page.locator('#mobile-save-title').inner_text(),flush=True)
    with page.expect_download(timeout=20000) as dl:
        page.locator('#mobile-save-link').click()
    gif=dl.value;gif.save_as('/tmp/xclip-mobile.gif')
    assert pathlib.Path('/tmp/xclip-mobile.gif').read_bytes().startswith(b'GIF89a')
    print('MOBILE GIF PASS:',gif.suggested_filename,pathlib.Path('/tmp/xclip-mobile.gif').stat().st_size,flush=True)
    assert not errors,errors
    print('MOBILE JS ERRORS:',errors,flush=True)
    browser.close()
