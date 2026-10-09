import asyncio
import base64
import json
import os
import urllib.request
import websockets

ARTIFACTS_DIR = "/usr/local/google/home/panliuyang/.gemini/jetski/brain/a9c788d2-785e-44be-b4a6-f9275540daa4/screenshots"
LOCAL_DIR = "/usr/local/google/home/panliuyang/workspace/banana_milkshake/test_evidence"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(LOCAL_DIR, exist_ok=True)

class ChromeTester:
    def __init__(self, port=9222):
        self.port = port
        self.ws = None
        self.msg_id = 0
        self.target_id = None

    async def open_tab(self, url, width=1280, height=850):
        req = urllib.request.Request(f"http://localhost:{self.port}/json/new?{url}", method="PUT")
        with urllib.request.urlopen(req) as resp:
            tab = json.loads(resp.read().decode())
        self.target_id = tab["id"]
        self.ws = await websockets.connect(tab["webSocketDebuggerUrl"], max_size=100*1024*1024)
        await self.call("Runtime.enable")
        await self.call("Page.enable")
        await self.call("DOM.enable")
        await self.call("Emulation.setDeviceMetricsOverride", {
            "width": width,
            "height": height,
            "deviceScaleFactor": 1,
            "mobile": False
        })
        await asyncio.sleep(2.0)

    async def call(self, method, params=None):
        self.msg_id += 1
        cid = self.msg_id
        payload = {"id": cid, "method": method}
        if params:
            payload["params"] = params
        await self.ws.send(json.dumps(payload))
        while True:
            msg = await self.ws.recv()
            data = json.loads(msg)
            if data.get("id") == cid:
                return data.get("result", {})

    async def eval(self, js):
        res = await self.call("Runtime.evaluate", {
            "expression": js,
            "returnByValue": True,
            "awaitPromise": True
        })
        return res.get("result", {}).get("value")

    async def screenshot(self, filename):
        res = await self.call("Page.captureScreenshot", {"format": "png"})
        raw = base64.b64decode(res["data"])
        p1 = os.path.join(LOCAL_DIR, filename)
        p2 = os.path.join(ARTIFACTS_DIR, filename)
        with open(p1, "wb") as f:
            f.write(raw)
        with open(p2, "wb") as f:
            f.write(raw)
        print(f"Captured: {filename} ({len(raw)} bytes)")

    async def close(self):
        if self.ws:
            await self.ws.close()
        if self.target_id:
            try:
                urllib.request.urlopen(f"http://localhost:{self.port}/json/close/{self.target_id}")
            except Exception:
                pass

async def main():
    tester = ChromeTester()
    try:
        print("Navigating to http://localhost:3001 at 1280x850 viewport...")
        await tester.open_tab("http://localhost:3001", width=1280, height=850)
        await asyncio.sleep(1.5)

        # 确保为简体中文界面
        is_zh = await tester.eval("localStorage.getItem('banana_lang') === 'zh' || !localStorage.getItem('banana_lang')")
        if not is_zh:
            print("Switching language to Simplified Chinese (zh)...")
            await tester.eval("localStorage.setItem('banana_lang', 'zh'); location.reload();")
            await asyncio.sleep(2.0)

        # 1. 验证版本号
        version_text = await tester.eval("document.querySelector('header span.text-gray-500')?.textContent")
        print(f"Detected Version in Header: {version_text}")
        assert "2026.10.9" in str(version_text), f"Version mismatch: {version_text}"

        # 2. 验证导航栏项高度与折行检测
        nav_info = await tester.eval("""
            Array.from(document.querySelectorAll('nav .nav-item')).map(el => ({
                text: el.innerText.trim(),
                width: el.offsetWidth,
                height: el.offsetHeight,
                isSingleLine: el.offsetHeight < 45
            }))
        """)
        print("Navigation items diagnostic:")
        for item in nav_info:
            print(f" - {item['text']}: width={item['width']}px, height={item['height']}px (Single line: {item['isSingleLine']})")
            assert item['isSingleLine'], f"Nav item '{item['text']}' is wrapping into multiple lines! Height={item['height']}px"

        # 3. 切换至广告尺寸智能重构页面 (用户截图所在页面)
        print("Switching to Ad Resizer page...")
        await tester.eval("Array.from(document.querySelectorAll('nav .nav-item')).find(el => el.innerText.includes('尺寸'))?.click()")
        await asyncio.sleep(1.5)

        # 检查尺寸页面下的导航栏是否依然单行无折行
        resizer_nav_info = await tester.eval("""
            Array.from(document.querySelectorAll('nav .nav-item')).map(el => ({
                text: el.innerText.trim(),
                width: el.offsetWidth,
                height: el.offsetHeight,
                isSingleLine: el.offsetHeight < 45
            }))
        """)
        print("Resizer page active - Nav items check:")
        for item in resizer_nav_info:
            print(f" - {item['text']}: height={item['height']}px")
            assert item['isSingleLine']

        # 截图 1: Resizer 页面（完美消除折行，版本 2026.10.9）
        await tester.screenshot("v6_01_resizer_nowrap_v2026_10_9.png")

        # 4. 切换到单素材创作中心
        print("Switching to Creation Studio page...")
        await tester.eval("Array.from(document.querySelectorAll('nav .nav-item')).find(el => el.innerText.includes('创作'))?.click()")
        await asyncio.sleep(1.5)
        await tester.screenshot("v6_02_creation_nowrap_v2026_10_9.png")

        # 5. 切换到广告模板库
        print("Switching to Template Library page...")
        await tester.eval("Array.from(document.querySelectorAll('nav .nav-item')).find(el => el.innerText.includes('模板'))?.click()")
        await asyncio.sleep(1.5)
        await tester.screenshot("v6_03_library_nowrap_v2026_10_9.png")

        print("SUCCESS! All layout checks passed with 100% single-line precision and version v2026.10.9 verified.")

    finally:
        await tester.close()

if __name__ == "__main__":
    asyncio.run(main())
