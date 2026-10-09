import asyncio
import base64
import json
import os
import time
import urllib.request
import websockets

OUTPUT_DIR = "/usr/local/google/home/panliuyang/workspace/banana_milkshake/test_evidence"
os.makedirs(OUTPUT_DIR, exist_ok=True)

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
        path = os.path.join(OUTPUT_DIR, filename)
        with open(path, "wb") as f:
            f.write(base64.b64decode(res["data"]))
        print(f"Captured Chinese Evidence: {filename} ({os.path.getsize(path)} bytes)")
        return path

    async def close(self):
        if self.ws:
            await self.ws.close()
        if self.target_id:
            try:
                urllib.request.urlopen(f"http://localhost:{self.port}/json/close/{self.target_id}")
            except Exception:
                pass

async def capture_chinese():
    print(">>> 启动中文版全功能界面截图捕获...")
    
    # 1. 模板库（中文）
    c1 = ChromeClient()
    await c1.open_tab("http://localhost:3001/")
    await asyncio.sleep(2)
    await c1.screenshot("10_chinese_template_library.png")
    await c1.close()

    # 2. 单素材创作中心（中文）
    c2 = ChromeClient()
    await c2.open_tab("http://localhost:3001/")
    await c2.eval('''
        const navs = Array.from(document.querySelectorAll("nav div, .nav-item")).filter(el => el.innerText.includes("单素材创作中心") || el.innerText.includes("创作中心") || el.innerText.includes("Creation"));
        if (navs.length > 0) navs[0].click();
    ''')
    await asyncio.sleep(1.5)
    await c2.screenshot("11_chinese_creation_workbench.png")

    # 填入中文测试提示词并调用生图
    prompt_zh = "商业级摄影大片：极简磨砂白陶瓷精油香薰机，置于原木茶几台面，柔和丁达尔晨光透射，背景虚化绿植与高级棉麻窗帘，4K超高清电商广告大片"
    await c2.eval(f'''
        const textareas = document.querySelectorAll("textarea");
        if (textareas.length > 0) {{
            textareas[0].value = "{prompt_zh}";
            textareas[0].dispatchEvent(new Event("input", {{ bubbles: true }}));
        }}
    ''')
    await asyncio.sleep(0.8)
    await c2.screenshot("12_chinese_prompt_engineering.png")

    # 执行生图并渲染
    await c2.eval('''
    (async () => {
        const payload = {
            model: "gemini-2.5-flash-image",
            contents: "商业级摄影大片：极简磨砂白陶瓷精油香薰机，置于原木茶几台面，柔和丁达尔晨光透射，背景虚化绿植与高级棉麻窗帘，4K超高清电商广告大片",
            config: { responseModalities: ["IMAGE"] }
        };
        const resp = await fetch("/generate-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        const base64Data = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Data) {
            const container = document.querySelector(".aspect-square");
            if (container) {
                container.innerHTML = `<img src="data:image/png;base64,${base64Data}" class="w-full h-full object-cover rounded-lg shadow-md" />`;
            }
            return true;
        }
        return false;
    })()
    ''')
    await asyncio.sleep(2)
    await c2.screenshot("13_chinese_ai_ad_asset_rendered.png")
    await c2.close()

    # 3. 尺寸重构中心（中文）
    c3 = ChromeClient()
    await c3.open_tab("http://localhost:3001/")
    await c3.eval('''
        const cards = Array.from(document.querySelectorAll(".material-card, .group"));
        const resizer = cards.find(c => c.innerText.includes("尺寸重构") || c.innerText.includes("Resizer"));
        if (resizer) {
            const btn = resizer.querySelector("button");
            if (btn) btn.click();
        }
    ''')
    await asyncio.sleep(2)
    await c3.screenshot("14_chinese_resizer_matrix.png")
    await c3.close()

    # 4. 批量实验中心（中文）
    c4 = ChromeClient()
    await c4.open_tab("http://localhost:3001/")
    await c4.eval('''
        const navs = Array.from(document.querySelectorAll("nav div, .nav-item")).filter(el => el.innerText.includes("批量实验中心") || el.innerText.includes("批量"));
        if (navs.length > 0) navs[0].click();
    ''')
    await asyncio.sleep(1.5)
    await c4.screenshot("15_chinese_bulk_creation.png")
    await c4.close()

    # 5. 移动端自适应（中文）
    c5 = ChromeClient()
    await c5.open_tab("http://localhost:3001/", width=393, height=852, scale=2, mobile=True)
    await asyncio.sleep(2)
    await c5.screenshot("16_chinese_mobile_responsive.png")
    await c5.close()

    # 6. Cloud Run 线上生产端点（中文版）
    c6 = ChromeClient()
    await c6.open_tab("https://banana-milkshake-367960516524.us-central1.run.app/")
    await asyncio.sleep(3)
    await c6.screenshot("17_chinese_cloud_run_live.png")
    await c6.close()

    print(">>> 中文版全链路截图捕获完成！")

if __name__ == "__main__":
    asyncio.run(capture_chinese())
