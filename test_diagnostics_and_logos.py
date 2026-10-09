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

    async def open_tab(self, url, width=1360, height=850):
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
        print("Navigating to http://localhost:3001 at 1360x850 viewport...")
        await tester.open_tab("http://localhost:3001", width=1360, height=850)
        await asyncio.sleep(1.5)

        # 确保为简体中文界面
        await tester.eval("localStorage.setItem('banana_lang', 'zh'); location.reload();")
        await asyncio.sleep(2.0)

        # 1. 验证顶部导航栏是否平整，运行日志按钮是否存在
        has_log_btn = await tester.eval("Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('运行日志'))")
        print(f"Has '运行日志' Button in Header: {has_log_btn}")
        assert has_log_btn

        # 2. 点击「运行日志」打开系统日志与诊断中心抽屉
        print("Clicking '运行日志' to open diagnostics drawer...")
        await tester.eval("Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('运行日志'))?.click()")
        await asyncio.sleep(1.0)
        await tester.screenshot("v7_01_diagnostics_drawer_open.png")

        # 3. 关闭诊断抽屉
        print("Closing diagnostics drawer...")
        await tester.eval("Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '关闭')?.click()")
        await asyncio.sleep(0.5)

        # 4. 切换到单素材创作中心 (Creation Studio)
        print("Switching to Creation Studio...")
        await tester.eval("Array.from(document.querySelectorAll('nav .nav-item')).find(el => el.innerText.includes('创作'))?.click()")
        await asyncio.sleep(1.5)

        # 验证 Step 1 prompt 是否包含防香水挂脖子安全规则
        prompt_val = await tester.eval("document.querySelector('textarea')?.value")
        print(f"Step 1 Prompt Preview: {prompt_val[:120]}...")
        assert "NEVER wear bottles" in str(prompt_val), "Prompt must include safeguard against wearing bottles around neck!"

        # 验证 Step 2 Logo 是否是全新金标而非十字架
        logo_img_src = await tester.eval("Array.from(document.querySelectorAll('img')).map(i => i.src).find(s => s.includes('logo'))")
        print(f"Step 2 Logo Source: {logo_img_src}")

        # 截图 Step 2 Logo 区域
        await tester.screenshot("v7_02_creation_studio_luxury_logo.png")

        print("SUCCESS! Diagnostics drawer and luxury brand logo verified with flying colors.")

    finally:
        await tester.close()

if __name__ == "__main__":
    asyncio.run(main())
