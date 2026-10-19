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
    print('BROWSER ERRORS:',errors,flush=True)
    assert not errors
    browser.close()
