import os
from PIL import Image, ImageDraw, ImageFont

output_dir = "/usr/local/google/home/panliuyang/workspace/banana_milkshake/public/logos"
os.makedirs(output_dir, exist_ok=True)

# 1. LUMINA PARIS - Luxury High-Jewelry & Fragrance Emblem
# 800 x 240, transparent background
w, h = 800, 240
img1 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d1 = ImageDraw.Draw(img1)

# Left emblem: Faceted Geometric Diamond Crest in Gold (#d97706, #fbbf24, #fef08a)
# Center of emblem at (100, 120)
cx, cy = 100, 120

# Draw background dark circular badge with gold rim for maximum contrast on ANY background
d1.ellipse([cx - 58, cy - 58, cx + 58, cy + 58], fill=(15, 23, 42, 230), outline=(217, 119, 6, 255), width=3)
d1.ellipse([cx - 52, cy - 52, cx + 52, cy + 52], fill=None, outline=(251, 191, 36, 180), width=1)

# Draw faceted luxury diamond icon
# Top crown line
d1.polygon([(cx - 28, cy - 14), (cx + 28, cy - 14), (cx + 38, cy + 2), (cx, cy + 34), (cx - 38, cy + 2)], fill=(245, 158, 11, 240), outline=(254, 240, 138, 255))
# Facet lines
d1.line([(cx - 14, cy - 14), (cx - 20, cy + 2), (cx, cy + 34)], fill=(254, 240, 138, 255), width=2)
d1.line([(cx + 14, cy - 14), (cx + 20, cy + 2), (cx, cy + 34)], fill=(254, 240, 138, 255), width=2)
d1.line([(cx - 20, cy + 2), (cx + 20, cy + 2)], fill=(254, 240, 138, 255), width=2)
d1.line([(cx - 14, cy - 14), (cx, cy + 2), (cx + 14, cy - 14)], fill=(254, 240, 138, 255), width=2)
d1.line([(cx, cy + 2), (cx, cy + 34)], fill=(254, 240, 138, 255), width=2)

# Small gold star above diamond
d1.polygon([(cx, cy - 36), (cx + 4, cy - 26), (cx + 14, cy - 26), (cx + 6, cy - 20), (cx + 9, cy - 10), (cx, cy - 16), (cx - 9, cy - 10), (cx - 6, cy - 20), (cx - 14, cy - 26), (cx - 4, cy - 26)], fill=(251, 191, 36, 255))

# Typography: LUMINA PARIS
try:
    font_main = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 46)
    font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
except Exception:
    font_main = ImageFont.load_default()
    font_sub = ImageFont.load_default()

# Dark backing pill for text contrast
d1.rounded_rectangle([180, 50, 760, 190], radius=14, fill=(15, 23, 42, 210), outline=(217, 119, 6, 120), width=2)

# Gold text with shadow
tx, ty = 210, 70
d1.text((tx + 2, ty + 2), "L U M I N A", font=font_main, fill=(0, 0, 0, 180))
d1.text((tx, ty), "L U M I N A", font=font_main, fill=(251, 191, 36, 255))

# Subtitle
d1.text((tx + 4, ty + 64), "PARIS  ·  HAUTE PARFUMERIE", font=font_sub, fill=(226, 232, 240, 240))

p1 = os.path.join(output_dir, "logo_lumina_luxury.png")
img1.save(p1)
print(f"Saved: {p1} ({os.path.getsize(p1)} bytes)")


# 2. AERO MAX - Athletic High-Tech Velocity Wing
img2 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d2 = ImageDraw.Draw(img2)
cx2, cy2 = 100, 120

d2.rounded_rectangle([cx2 - 60, cy2 - 60, cx2 + 60, cy2 + 60], radius=18, fill=(17, 24, 39, 230), outline=(56, 189, 248, 255), width=3)
# Dynamic wings
d2.polygon([(cx2 - 40, cy2 + 25), (cx2 + 5, cy2 - 35), (cx2 + 35, cy2 - 35), (cx2 - 10, cy2 + 25)], fill=(14, 165, 233, 255))
d2.polygon([(cx2 - 15, cy2 + 25), (cx2 + 25, cy2 - 15), (cx2 + 45, cy2 - 15), (cx2 + 5, cy2 + 25)], fill=(236, 72, 153, 255))

d2.rounded_rectangle([180, 50, 760, 190], radius=14, fill=(17, 24, 39, 210), outline=(56, 189, 248, 120), width=2)
try:
    font_bold_italic = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 46)
except Exception:
    font_bold_italic = font_main

d2.text((210, 68), "A E R O  M A X", font=font_bold_italic, fill=(255, 255, 255, 255))
d2.text((214, 134), "ATHLETIC PERFORMANCE  ·  EST. 2026", font=font_sub, fill=(56, 189, 248, 255))

p2 = os.path.join(output_dir, "logo_aero_sports.png")
img2.save(p2)
print(f"Saved: {p2} ({os.path.getsize(p2)} bytes)")


# 3. VERDANT ORGANIC - Premium Botanical Laurel
img3 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d3 = ImageDraw.Draw(img3)
cx3, cy3 = 100, 120

d3.ellipse([cx3 - 58, cy3 - 58, cx3 + 58, cy3 + 58], fill=(6, 78, 59, 230), outline=(52, 211, 153, 255), width=3)
# Botanical leaves
d3.arc([cx3 - 35, cy3 - 35, cx3 + 35, cy3 + 35], start=40, end=320, fill=(209, 250, 229, 255), width=3)
# Central leaf
d3.polygon([(cx3, cy3 - 30), (cx3 + 16, cy3), (cx3, cy3 + 30), (cx3 - 16, cy3)], fill=(52, 211, 153, 255), outline=(240, 253, 244, 255))
d3.line([(cx3, cy3 - 30), (cx3, cy3 + 30)], fill=(6, 78, 59, 255), width=2)

d3.rounded_rectangle([180, 50, 760, 190], radius=14, fill=(6, 78, 59, 210), outline=(52, 211, 153, 120), width=2)
d3.text((210, 70), "V E R D A N T", font=font_main, fill=(240, 253, 244, 255))
d3.text((214, 134), "ORGANIC BOTANICALS  ·  PURE NATURE", font=font_sub, fill=(167, 243, 208, 255))

p3 = os.path.join(output_dir, "logo_verdant_organic.png")
img3.save(p3)
print(f"Saved: {p3} ({os.path.getsize(p3)} bytes)")
