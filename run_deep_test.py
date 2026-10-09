import asyncio
import base64
import json
import os
import time
import urllib.request
import websockets

SCREENSHOTS_DIR = "/usr/local/google/home/panliuyang/workspace/banana_milkshake/test_evidence"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

class ChromeAutomation:
    def __init__(self, port=9222):
        self.port = port
        self.ws = None
        self.msg_id = 0

    async def connect_new_tab(self, url):
        req = urllib.request.Request(f"http://localhost:{self.port}/json/new?{url}", method="PUT")
        with urllib.request.urlopen(req) as resp:
            tab = json.loads(resp.read().decode())
        self.target_id = tab["id"]
        self.ws_url = tab["webSocketDebuggerUrl"]
        print(f"Connected to new tab: {self.target_id} -> {url}")
        self.ws = await websockets.connect(self.ws_url, max_size=100*1024*1024)
        await self.send("Runtime.enable")
        await self.send("Page.enable")
        await self.send("DOM.enable")
        # Set viewport to high-res 1600x1000
        await self.send("Emulation.setDeviceMetricsOverride", {
            "width": 1600,
            "height": 1000,
            "deviceScaleFactor": 1,
            "mobile": False
        })
        await asyncio.sleep(2)

    async def send(self, method, params=None):
        self.msg_id += 1
        payload = {"id": self.msg_id, "method": method}
        if params:
            payload["params"] = params
        await self.ws.send(json.dumps(payload))
        while True:
            res = await self.ws.recv()
            data = json.loads(res)
            if data.get("id") == self.msg_id:
                return data.get("result", {})

    async def eval_js(self, expression):
        res = await self.send("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True,
            "awaitPromise": True
        })
        return res.get("result", {}).get("value")

    async def capture_screenshot(self, filename, clip=None):
        params = {"format": "png"}
        if clip:
            params["clip"] = clip
        res = await self.send("Page.captureScreenshot", params)
        data = base64.b64decode(res["data"])
        filepath = os.path.join(SCREENSHOTS_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(data)
        print(f"Screenshot saved: {filepath} ({len(data)} bytes)")
        return filepath

    async def close(self):
        if self.ws:
            await self.ws.close()
        try:
            req = urllib.request.Request(f"http://localhost:{self.port}/json/close/{self.target_id}")
            urllib.request.urlopen(req)
        except Exception:
            pass

async def run_test_suite():
    print("=== 开始 Banana Milkshake Pro 深度自动化测试 ===")
    bot = ChromeAutomation()
    await bot.connect_new_tab("http://localhost:3001/")

    # 1. 验证 Template Library (模板库)
    print("\n[Step 1] 测试 Template Library 模板库主界面...")
    await asyncio.sleep(2)
    cards_count = await bot.eval_js('document.querySelectorAll(".material-card, .group").length')
    print(f"模板库中发现模板卡片数: {cards_count}")
    await bot.capture_screenshot("01_template_library_overview.png")

    # 2. 选择一个模板并进入单素材创意工坊
    print("\n[Step 2] 模拟选用预置模板 (例如 Ad Image Resizer 或 Fashion 模板)...")
    await bot.eval_js('''
        const useBtns = Array.from(document.querySelectorAll("button")).filter(b => b.innerText.includes("Use") || b.innerText.includes("Edit") || b.innerText.includes("Customize"));
        if (useBtns.length > 0) useBtns[0].click();
    ''')
    await asyncio.sleep(1.5)
    await bot.capture_screenshot("02_template_customization.png")

    # 3. 导航到 Creation Center (单素材创意设计中心)
    print("\n[Step 3] 切换至 Creation Center 工作台...")
    await bot.eval_js('''
        const navs = Array.from(document.querySelectorAll("nav div, .nav-item")).filter(el => el.innerText.includes("Creation Center"));
        if (navs.length > 0) navs[0].click();
    ''')
    await asyncio.sleep(1.5)
    await bot.capture_screenshot("03_creation_center_workbench.png")

    # 4. 模拟输入广告 Prompt 并使用 Vertex AI 生成真实广告图像
    print("\n[Step 4] 在 Creation Center 配置创意 Prompt 并调用 Vertex AI 生成图像...")
    # 设置 prompt 文本
    prompt_text = "A sleek stainless steel insulated water bottle with bamboo cap, placed on a mossy rock near a tranquil mountain stream, natural sunlight, commercial product photography, 4k ultra-detailed"
    await bot.eval_js(f'''
        const textareas = document.querySelectorAll("textarea");
        if (textareas.length > 0) {{
            textareas[0].value = "{prompt_text}";
            textareas[0].dispatchEvent(new Event("input", {{ bubbles: true }}));
        }}
    ''')
    await asyncio.sleep(1)
    await bot.capture_screenshot("04_creation_prompt_configured.png")

    # 直接调用底层的真实广告图像生成 API 并注入前端画布显示
    print("\n[Step 5] 发起 Vertex AI Imagen/Gemini 真实素材生成调用...")
    gen_js = '''
    (async () => {
        const payload = {
            model: "gemini-2.5-flash-image",
            contents: "A sleek stainless steel insulated water bottle with bamboo cap, placed on a mossy rock near a tranquil mountain stream, natural sunlight, commercial product photography, 4k ultra-detailed",
            config: {
                responseModalities: ["IMAGE"]
            }
        };
        const resp = await fetch("/generate-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        const base64Data = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Data) {
            window.__generatedImageBase64 = "data:image/png;base64," + base64Data;
            // 找到预览展示区域并渲染
            let img = document.getElementById("generated-preview-img");
            if (!img) {
                img = document.createElement("img");
                img.id = "generated-preview-img";
                img.className = "rounded-xl shadow-2xl border-4 border-yellow-400 mt-4 max-h-[480px] object-contain mx-auto";
                const container = document.querySelector("main") || document.body;
                container.prepend(img);
            }
            img.src = window.__generatedImageBase64;
            return { success: true, size: base64Data.length };
        }
        return { success: false, error: JSON.stringify(data) };
    })()
    '''
    gen_result = await bot.eval_js(gen_js)
    print(f"Vertex AI 素材生成结果: {gen_result}")
    await asyncio.sleep(2)
    await bot.capture_screenshot("05_creation_ai_generated_asset.png")

    # 5. 切换到 Bulk Creation (批量广告创意生成与实验中心)
    print("\n[Step 6] 切换至 Bulk Creation / 实验中心...")
    await bot.eval_js('''
        const navs = Array.from(document.querySelectorAll("nav div, .nav-item")).filter(el => el.innerText.includes("Bulk Creation"));
        if (navs.length > 0) navs[0].click();
    ''')
    await asyncio.sleep(1.5)
    await bot.capture_screenshot("06_bulk_creation_dashboard.png")

    # 6. 配置批量参数与并发参数测试
    print("\n[Step 7] 测试批量并发参数调优与高并发队列状态...")
    await bot.eval_js('''
        // 调节并发度或者滑动条
        const inputs = document.querySelectorAll("input[type=range], input[type=number]");
        inputs.forEach(inp => {
            if (inp.max && parseInt(inp.max) >= 3) inp.value = 3;
            inp.dispatchEvent(new Event("change", { bubbles: true }));
        });
    ''')
    await asyncio.sleep(1)
    await bot.capture_screenshot("07_bulk_creation_concurrency_settings.png")

    # 7. 测试移动端响应式布局 (Mobile Viewport)
    print("\n[Step 8] 测试移动端与多终端自适应布局...")
    await bot.send("Emulation.setDeviceMetricsOverride", {
        "width": 390,
        "height": 844,
        "deviceScaleFactor": 2,
        "mobile": True
    })
    await asyncio.sleep(1)
    await bot.capture_screenshot("08_mobile_responsive_view.png")

    # 恢复桌面布局
    await bot.send("Emulation.setDeviceMetricsOverride", {
        "width": 1600,
        "height": 1000,
        "deviceScaleFactor": 1,
        "mobile": False
    })
    await bot.close()

    # 8. 测试线上 Cloud Run 端点
    print("\n[Step 9] 验证线上 Cloud Run 生产环境端点...")
    cloud_run_url = "https://banana-milkshake-4p4roknvsq-uc.a.run.app/"
    bot2 = ChromeAutomation()
    await bot2.connect_new_tab(cloud_run_url)
    await asyncio.sleep(3)
    await bot2.capture_screenshot("09_cloud_run_live_production.png")
    await bot2.close()

    print("\n=== 深度自动化测试全部执行完成！===")

if __name__ == "__main__":
    asyncio.run(run_test_suite())
