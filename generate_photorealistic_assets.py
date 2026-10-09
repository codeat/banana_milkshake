import os
import json
import time
import base64
import urllib.request

PUBLIC_DIR = "/usr/local/google/home/panliuyang/workspace/banana_milkshake/public"
PREVIEWS_DIR = os.path.join(PUBLIC_DIR, "previews")
PRODUCTS_DIR = os.path.join(PUBLIC_DIR, "products")
os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(PRODUCTS_DIR, exist_ok=True)

MODEL = "gemini-nano-banana-2.1"
API_URL = "http://localhost:3001/generate-content"

def generate_image(prompt, aspect_ratio="1:1", retry=2):
    payload = {
        "model": MODEL,
        "contents": {
            "role": "user",
            "parts": [{"text": prompt}]
        },
        "config": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": aspect_ratio}
        }
    }
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    for attempt in range(retry + 1):
        try:
            t0 = time.time()
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                img_part = next((p for p in parts if "inlineData" in p), None)
                if img_part:
                    raw_b64 = img_part["inlineData"]["data"]
                    img_bytes = base64.b64decode(raw_b64)
                    print(f"  -> Generated {len(img_bytes)} bytes in {time.time()-t0:.2f}s")
                    return img_bytes, f"data:image/png;base64,{raw_b64}"
                else:
                    print(f"  Attempt {attempt+1}: No image data in response.")
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            if attempt < retry:
                time.sleep(2)
    return None, None

def main():
    print("==================================================")
    print(f"Generating Photorealistic Assets using {MODEL}...")
    print("==================================================")

    # 1. Product Demo Assets
    products = [
        {
            "id": "perfume",
            "prompt": "Commercial packshot of a luxury French glass perfume bottle with a polished gold metallic cap. Isolated on clean neutral off-white background with soft, natural drop shadow below. High-end luxury cosmetics advertisement, crystal clear glass reflection, realistic studio softbox lighting, 8k resolution.",
            "aspect": "1:1",
            "filename": "demo_perfume.png"
        },
        {
            "id": "sneaker",
            "prompt": "Commercial studio photograph of a modern aerodynamic running sneaker, hovering slightly in mid-air at a dynamic 3/4 angle. Isolated on clean off-white studio background with soft realistic contact shadow underneath. Hyper-detailed textile mesh, vibrant cyan and orange accents, commercial Nike/Adidas campaign style, 8k resolution.",
            "aspect": "1:1",
            "filename": "demo_sneaker.png"
        },
        {
            "id": "headphone",
            "prompt": "Studio product photograph of premium over-ear wireless noise-cancelling headphones in matte black with champagne gold metallic accents. Displayed resting upright on a minimalist stand. Clean neutral grey studio background, dramatic rim lighting accentuating the chamfered edges, 8k ultra-sharp detail.",
            "aspect": "1:1",
            "filename": "demo_headphone.png"
        },
        {
            "id": "coffee",
            "prompt": "Photorealistic commercial shot of a handcrafted ceramic coffee cup filled with fresh cappuccino featuring delicate latte art. Resting on matching ceramic saucer with roasted coffee beans scattered neatly beside. Warm neutral studio background with soft morning sun shadows, professional food photography.",
            "aspect": "1:1",
            "filename": "demo_coffee.png"
        }
    ]

    # 2. Template Covers
    templates = [
        {
            "id": "streetSnap",
            "prompt": "High fashion editorial street photograph of a stylish model walking confidently down a sunny modern city street. Wearing a chic tailored designer coat, urban glass architecture softly blurred in background, vibrant warm sunlight, Vogue magazine editorial style, cinematic depth of field.",
            "aspect": "4:3",
            "filename": "cover_street_snap.png"
        },
        {
            "id": "virtualTryOn",
            "prompt": "Commercial fashion studio photoshoot of an elegant female model wearing a modern structured coral-pink blazer and matching tailored trousers. Natural confident pose against a soft pastel gradient studio backdrop, even diffuse lighting, clean high-end retail lookbook.",
            "aspect": "1:1",
            "filename": "cover_virtual_try_on.png"
        },
        {
            "id": "brandGuideline",
            "prompt": "High-end commercial advertisement for luxury skincare. Amber glass serum bottle standing elegantly on polished white Carrara marble slab. Subtle water ripples, golden morning sunlight with delicate caustics, clean typography space, editorial beauty campaign.",
            "aspect": "4:5",
            "filename": "cover_brand_guideline.png"
        },
        {
            "id": "bundle",
            "prompt": "Commercial advertising flatlay of a luxury organic skincare bundle set: amber dropper serum bottle, minimalist cream jar, and toner. Arranged artistically on textured stone with delicate green eucalyptus leaves, bright natural daylight, clean aesthetic.",
            "aspect": "16:9",
            "filename": "cover_bundle.png"
        },
        {
            "id": "holiday",
            "prompt": "Commercial holiday promotion hero shot. Elegant gift boxes wrapped in deep emerald green paper with rich champagne gold satin ribbons. Soft warm glowing fairy lights and bokeh in background, festive luxury atmosphere, advertisement banner.",
            "aspect": "1:1",
            "filename": "cover_holiday.png"
        },
        {
            "id": "resizer",
            "prompt": "High fashion commercial advertising banner. Elegant model in an eye-catching bright orange designer trench coat posing against sleek modern European glass and concrete building facade, bright even daylight, clean editorial framing.",
            "aspect": "16:9",
            "filename": "cover_resizer.png"
        }
    ]

    results_data = {"products": {}, "templates": {}}

    print("\n--- 1. Generating Real Products ---")
    for p in products:
        print(f"Generating product: {p['id']} ({p['filename']})...")
        img_bytes, data_url = generate_image(p["prompt"], p["aspect"])
        if img_bytes:
            out_path = os.path.join(PRODUCTS_DIR, p["filename"])
            with open(out_path, "wb") as f:
                f.write(img_bytes)
            results_data["products"][p["id"]] = {
                "file": f"/products/{p['filename']}",
                "dataUrl": data_url
            }
        time.sleep(1)

    print("\n--- 2. Generating Template Covers ---")
    for tpl in templates:
        print(f"Generating template cover: {tpl['id']} ({tpl['filename']})...")
        img_bytes, data_url = generate_image(tpl["prompt"], tpl["aspect"])
        if img_bytes:
            out_path = os.path.join(PREVIEWS_DIR, tpl["filename"])
            with open(out_path, "wb") as f:
                f.write(img_bytes)
            results_data["templates"][tpl["id"]] = {
                "file": f"/previews/{tpl['filename']}",
                "dataUrl": data_url
            }
        time.sleep(1)

    # Save metadata mapping for easy integration
    meta_path = os.path.join(PUBLIC_DIR, "real_assets_manifest.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        # Save without massive dataUrls to keep manifest light
        light_manifest = {
            "products": {k: v["file"] for k, v in results_data["products"].items()},
            "templates": {k: v["file"] for k, v in results_data["templates"].items()}
        }
        json.dump(light_manifest, f, indent=2)
    print(f"\nManifest saved to {meta_path}")

    # Also save full base64 for fallback
    full_path = "/usr/local/google/home/panliuyang/workspace/banana_milkshake/src/data/generated_images.json"
    with open(full_path, "w", encoding="utf-8") as f:
        json.dump(results_data, f)
    print(f"Full image data saved to {full_path}")

if __name__ == "__main__":
    main()
