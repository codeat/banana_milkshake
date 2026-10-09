import asyncio
import base64
import json
import os
import shutil
import time
import urllib.request
import websockets

ARTIFACTS_DIR = "/usr/local/google/home/panliuyang/.gemini/jetski/brain/a9c788d2-785e-44be-b4a6-f9275540daa4/screenshots"
LOCAL_DIR = "/usr/local/google/home/panliuyang/workspace/banana_milkshake/test_evidence"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(LOCAL_DIR, exist_ok=True)

class ChromeClient:
    def __init__(self, port=9222):
        self.port = port
        self.ws = None
        self.msg_id = 0
        self.target_id = None

    async def open_tab(self, url, width=1600, height=1000, scale=1, mobile=False):
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
            "deviceScaleFactor": scale,
            "mobile": mobile
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
        if self.target_id:
            try:
                urllib.request.urlopen(f"http://localhost:{self.port}/json/close/{self.target_id}")
            except Exception:
                pass
        if self.ws:
            await self.ws.close()

async def main():
    client = ChromeClient()
    try:
        print("Navigating to http://localhost:3001 ...")
        await client.open_tab("http://localhost:3001")
        await asyncio.sleep(2.0)

        # Set language to Simplified Chinese and reload
        await client.eval("""
            localStorage.setItem('banana_lang', 'zh');
            location.reload();
        """)
        await asyncio.sleep(2.0)

        # 1. Capture Library / Home with new Top Navigation
        print("Capturing 01 Library...")
        await client.screenshot("v3_01_top_nav_and_library.png")

        # 2. Click "单素材创作中心" (nav item 0)
        print("Clicking '单素材创作中心'...")
        await client.eval("""
            const navs = document.querySelectorAll('.nav-item');
            if (navs[0]) navs[0].click();
        """)
        await asyncio.sleep(2.0)
        await client.screenshot("v3_02_creation_studio_zero_cold_start.png")

        # 3. Click Demo Product [🧴 奢华法式香水]
        print("Clicking Demo Product [奢华法式香水]...")
        await client.eval("""
            const buttons = Array.from(document.querySelectorAll('button'));
            const perfumeBtn = buttons.find(b => b.textContent.includes('香水') || b.textContent.includes('Perfume'));
            if (perfumeBtn) perfumeBtn.click();
        """)
        await asyncio.sleep(1.0)
        await client.screenshot("v3_03_demo_asset_loaded.png")

        # 4. Click Scene Chip [✨ 奢华大理石展台]
        print("Clicking Scene Chip [奢华大理石展台]...")
        await client.eval("""
            const chips = Array.from(document.querySelectorAll('button'));
            const marbleChip = chips.find(b => b.textContent.includes('大理石') || b.textContent.includes('展台'));
            if (marbleChip) marbleChip.click();
        """)
        await asyncio.sleep(1.0)
        await client.screenshot("v3_04_scene_chip_appended.png")

        # 5. Click "📐 广告尺寸智能重构" (nav item 1)
        print("Navigating to Ad Resizer Matrix...")
        await client.eval("""
            const navs = document.querySelectorAll('.nav-item');
            if (navs[1]) navs[1].click();
        """)
        await asyncio.sleep(2.0)
        await client.screenshot("v3_05_ad_resizer_matrix.png")

        # 6. Click "批量实验中心" (nav item 3)
        print("Navigating to Bulk Experiment Center...")
        await client.eval("""
            const navs = document.querySelectorAll('.nav-item');
            if (navs[3]) navs[3].click();
        """)
        await asyncio.sleep(2.0)
        await client.screenshot("v3_06_bulk_experiment_center.png")

        print("All UI screenshots captured successfully!")

    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main())
