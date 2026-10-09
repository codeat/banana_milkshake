import asyncio
import base64
import json
import os
import time
import urllib.request
import websockets

OUTPUT_DIR = "/usr/local/google/home/panliuyang/workspace/banana_milkshake/test_evidence"
os.makedirs(OUTPUT_DIR, exist_ok=True)

class AutomationDriver:
    def __init__(self, port=9222):
        self.port = port
        self.ws = None
        self.msg_id = 0
        self.target_id = None

    async def open(self, url, width=1600, height=1000, scale=1, mobile=False):
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
        await asyncio.sleep(2.5)

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
        print(f"Captured: {path} ({os.path.getsize(path)} bytes)")
        return path

    async def close(self):
        if self.ws:
            await self.ws.close()
        if self.target_id:
            try:
                urllib.request.urlopen(f"http://localhost:{self.port}/json/close/{self.target_id}")
            except Exception:
                pass

async def capture_all():
    print(">>> 启动自动化测试与全链路截图采集流程...")
    
    # 1. 模板库概览
    driver = AutomationDriver()
    await driver.open("http://localhost:3001/")
    print("1. 捕获模板库主界面 (01_template_library_overview.png)...")
    await asyncio.sleep(2)
    await driver.screenshot("01_template_library_overview.png")
    await driver.close()

    # 2. 单素材创作中心 (Creation Center)
    driver = AutomationDriver()
    await driver.open("http://localhost:3001/")
    print("2. 切换至 Creation Center 工作台...")
    await driver.eval('''
        const navs = Array.from(document.querySelectorAll("nav div, .nav-item")).filter(el => el.innerText.includes("Creation Center"));
        if (navs.length > 0) navs[0].click();
    ''')
    await asyncio.sleep(1.5)
    await driver.screenshot("02_creation_studio_canvas.png")

    # 3. 填入真实广告营销 Prompt
    print("3. 配置广告素材生成 Prompt 与风格参数...")
    prompt_ad = "Commercial studio photograph of a premium organic cold-pressed avocado facial serum in a frosted amber glass dropper bottle. Placed on natural marble pedestal surrounded by fresh botanical eucalyptus leaves, soft studio golden hour backlighting, hyper-realistic, 8k resolution, award-winning beauty cosmetic advertisement."
    await driver.eval(f'''
        const textareas = document.querySelectorAll("textarea");
        if (textareas.length > 0) {{
            textareas[0].value = "{prompt_ad}";
            textareas[0].dispatchEvent(new Event("input", {{ bubbles: true }}));
        }}
    ''')
    await asyncio.sleep(1)
    await driver.screenshot("03_prompt_engineering_ai_director.png")

    # 4. 执行 Vertex AI 素材生成并展示结果
    print("4. 调用 Vertex AI 生成高清真实商用广告图片...")
    await driver.eval('''
    (async () => {
        const payload = {
            model: "gemini-2.5-flash-image",
            contents: "Commercial studio photograph of a premium organic cold-pressed avocado facial serum in a frosted amber glass dropper bottle. Placed on natural marble pedestal surrounded by fresh botanical eucalyptus leaves, soft studio golden hour backlighting, hyper-realistic, 8k resolution, award-winning beauty cosmetic advertisement.",
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
            const resultImg = document.querySelector(".aspect-square img") || document.createElement("img");
            resultImg.src = "data:image/png;base64," + base64Data;
            resultImg.className = "w-full h-full object-cover rounded-lg shadow-md";
            const container = document.querySelector(".aspect-square");
            if (container) {
                container.innerHTML = "";
                container.appendChild(resultImg);
            }
            return true;
        }
        return false;
    })()
    ''')
    await asyncio.sleep(2)
    await driver.screenshot("04_ai_ad_asset_rendered.png")
    await driver.close()

    # 5. Ad Image Resizer (全尺寸智能重构)
    driver = AutomationDriver()
    await driver.open("http://localhost:3001/")
    print("5. 切换至 Ad Image Resizer 智能广告尺寸矩阵...")
    await driver.eval('''
        const cards = Array.from(document.querySelectorAll(".material-card, .group"));
        const resizerCard = cards.find(c => c.innerText.includes("Resizer") || c.innerText.includes("Ad Image Resizer"));
        if (resizerCard) {
            const btn = resizerCard.querySelector("button");
            if (btn) btn.click();
        } else {
            const firstBtn = document.querySelector("button");
            if (firstBtn) firstBtn.click();
        }
    ''')
    await asyncio.sleep(2)
    await driver.screenshot("05_ad_image_resizer_matrix.png")
    await driver.close()

    # 6. Bulk Creation (批量广告创意生成与实验中心)
    driver = AutomationDriver()
    await driver.open("http://localhost:3001/")
    print("6. 切换至 Bulk Creation 批量实验中心...")
    await driver.eval('''
        const navs = Array.from(document.querySelectorAll("nav div, .nav-item")).filter(el => el.innerText.includes("Bulk Creation"));
        if (navs.length > 0) navs[0].click();
    ''')
    await asyncio.sleep(1.5)
    await driver.screenshot("06_bulk_creation_pipeline.png")
    await driver.close()

    # 7. Mobile Viewport (移动端自适应测试)
    driver = AutomationDriver()
    await driver.open("http://localhost:3001/", width=393, height=852, scale=2, mobile=True)
    print("7. 捕获移动端视口自适应布局 (07_mobile_responsive_experience.png)...")
    await asyncio.sleep(2)
    await driver.screenshot("07_mobile_responsive_experience.png")
    await driver.close()

    # 8. Cloud Run 线上生产环境验证
    driver = AutomationDriver()
    cloud_run_url = "https://banana-milkshake-367960516524.us-central1.run.app/"
    print(f"8. 捕获 Cloud Run 生产环境端点 ({cloud_run_url})...")
    await driver.open(cloud_run_url)
    await asyncio.sleep(3)
    await driver.screenshot("08_cloud_run_production_deployment.png")
    await driver.close()

    print(">>> 全链路高清截图捕获完毕！")

if __name__ == "__main__":
    asyncio.run(capture_all())
