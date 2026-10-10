/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {DEFAULT_IMAGE_MODEL} from '../constants';
import {Template} from '../types';
import {TEMPLATE_VISUALS} from './templateVisuals';

/**
 * An array of predefined templates used for generating image assets.
 * Each template includes a unique ID, name, description, preview image URL,
 * aspect ratio, the generative AI model to use, and a series of steps
 * detailing the image generation process.
 */
export const TEMPLATES: Template[] = [
  {
    id: 'street-snap',
    name: '街头潮流街拍 (Street Snap)',
    description: '为服装与配饰智能合成现代都市街景穿搭大片，光影自然，完美凸显商品版型与质感。',
    previewImage: TEMPLATE_VISUALS.streetSnap,
    category: 'fashion',
    badge: '🔥 潮流爆款',
    aspect_ratio: '4:3',
    genai_model: DEFAULT_IMAGE_MODEL,
    steps: [
      {
        name: 'Step 1: Generate Street Snap',
        text_prompt: `Generate a high-resolution editorial fashion photograph.
Extract the primary product from asset1.
Product Handling, Real-World Physical Scale & Model Integration:
- STRICT REAL-WORLD SCALE (CRITICAL): Every product MUST strictly obey authentic real-world physical dimensions relative to human anatomy (hand, fingers, wrist, face, torso). NEVER artificially enlarge, inflate, or oversize any product relative to the model.
- If asset1 is clothing or apparel (e.g. coats, jackets, shirts, pants, dresses): The model wears the garment naturally in a three-quarter or full-body street framing to showcase its silhouette, drape, and texture.
- If asset1 is footwear: The model wears the shoes naturally on their feet while walking.
- If asset1 is a handbag or leather goods: The model carries the bag naturally in hand or over the shoulder at authentic real-world leather-goods proportions.
- If asset1 is eyewear or wristwatch: The model wears the sunglasses naturally on their face or the watch naturally on their wrist, framed in a crisp medium close-up portrait so details are sharp at 1:1 real-world scale.
- If asset1 is a small handheld item (e.g. fragrance/perfume bottle, skincare serum dropper, lipstick, scented candle, beverage cup, headphones): A real 50ml–100ml perfume bottle, serum bottle, or cosmetic is only 8–12 cm tall and MUST fit delicately inside a single human palm or between the model's fingers (NEVER make a perfume bottle or cosmetic larger than the human hand, NEVER cradle it like a giant magnum bottle, and NEVER wear bottles/cosmetics around the neck as pendants). To showcase the small product's label and design details clearly, use a closer MEDIUM CLOSE-UP PORTRAIT framing (chest-up, 85mm f/1.8 lens) with the model holding the palm-sized product naturally in the foreground plane.
Background Scene: A dynamic realistic urban street, a modern city intersection or a concrete-and-glass commercial area with creamy bokeh depth of field. MUST: Expand the generated background to fill the entire landscape frame. DO NOT reuse the model pose or exact background from the input asset1.
Model Pose: The model is captured naturally in the city scene with a confident, effortless luxury commercial pose appropriate to the product's real-world scale.
Facial Expression: A neutral-to-serious powerful expression, a confident direct gaze at the camera or a strong profile.
Art Style: Clean crisp editorial street photography. Use bright even professional lighting to eliminate harsh shadows and make the product's color and features pop against the urban backdrop. Composition is minimalist, well-framed, and leaves clean negative space in the top-right corner for brand signature placement.
`,
        image_slots: [{asset_name: 'asset1', is_static: false}],
        text_variables: [],
      },
      {
        name: 'Step 2: Add Your Logo',
        text_prompt: `Place the provided "Brand Logo" (asset2) onto the final image (asset1).
1. If the final image already has a logo, replace it with the new one in the exact same position.
2. If the template does not have a logo, place the new logo cleanly in the top-right corner with balanced margins from the top and right edges.
3. Ensure the logo is clearly visible with crisp contrast, preserving the logo's exact emblem shape, transparent background, and brand typography with NO rectangular background box. It must never overlap the product or the model's head/face.
`,
        image_slots: [{asset_name: 'asset2', is_static: false}],
        text_variables: [],
      },
    ],
  },
  {
    id: 'virtual-try-on',
    name: '虚拟模特穿搭 (Virtual Try-On)',
    description: '提取服饰商品结构，自动生成合适肤色与体态的真人模特试穿大片，严格保留剪裁与材质细节。',
    previewImage: TEMPLATE_VISUALS.virtualTryOn,
    category: 'fashion',
    badge: '✨ 模特试穿',
    aspect_ratio: '1:1',
    genai_model: DEFAULT_IMAGE_MODEL,
    steps: [
      {
        name: 'Step 1: Add model for the product',
        text_prompt: `Generate a high-resolution, editorial fashion photograph based on the provided product image (asset1).
Core Product & Model:
1. Extract the primary product(s) from asset1.
2. Determine the product category (Apparel, Footwear, Eyewear/Watch/Bag, or Handheld Beauty/Fragrance) and the intended gender.
3. Select a diverse, fashion-forward model of the appropriate gender to wear or hold the product(s) properly.
4. STRICT REAL-WORLD PHYSICAL SCALE: Maintain 100% authentic real-world physical dimensions relative to human anatomy. If asset1 is a small handheld item (perfume bottle, serum, lipstick, candle), it must remain strictly palm-sized (8–12 cm tall, fitting delicately in one hand — NEVER oversized or giant) and be photographed in a closer chest-up medium close-up portrait.
5. Enhance the product's appearance to look like high-quality, real-world materials with realistic textures.

Staging & Background:
6.  Background Scene:
* If the product is a Costume: Use a clean, brightly lit white room with a few subtle, modern decorations.
* Otherwise: Use a realistic, simple, minimalist scene (e.g., a studio set, a concrete wall, or a clean urban backdrop).
7.  MUST: Expand the generated background to fill the entire frame.
8.  DO NOT reuse the model, pose, or exact background from the input asset1.

Strict Cropping and Display Rules:
9.  Model Pose & Gesture: The model stands confidently in a controlled, intentional pose that clearly displays the product at authentic 1:1 physical scale without distraction.
10. Facial Expression: A neutral-to-serious, powerful expression; a confident, direct gaze at the camera or a strong profile. Project a modern, fashion-forward attitude—avoid excessive AI-stylization or unnatural smiles.
11. Cropping Adherence:
Tops (e.g., Jackets, Coats, Shirts, Blouses): Upper body focus showcasing the garment's drape and tailoring.
Bottoms (e.g., Pants, Skirts, Shorts): Lower body focus from waist down to feet.
Full Garments (e.g., Dresses, Jumpsuits): Three-quarter or full body shot to display the silhouette.
Small Accessories / Perfumes / Cosmetics: Medium close-up portrait framing so the palm-sized item is crisp and detailed without inflating its physical size.

Art Style:
12. Art Style: Clean, crisp editorial photography. Use bright, even, and professional lighting (like a single softbox or reflector) to eliminate harsh shadows and make the product's color and features pop.
`,
        image_slots: [{asset_name: 'asset1', is_static: false}],
        text_variables: [],
      },
    ],
  },
  {
    id: 'brand-guideline-based-image-generation',
    name: '品牌视觉规范大片 (Brand Guideline Ad)',
    description: '严格遵循企业品牌调性、情绪板配色与 Logo 规范，融合商品主体生成专业品牌级电商营销海报。',
    previewImage: TEMPLATE_VISUALS.brandGuideline,
    category: 'retail',
    badge: '🎨 品牌定制',
    aspect_ratio: '4:5',
    genai_model: DEFAULT_IMAGE_MODEL,
    steps: [
      {
        name: 'Step 1: Generate Product Image Based On Sample Guideline',
        text_prompt: `
                You are a meticulous and highly skilled digital ad designer. Your sole purpose is to create a single, professional digital ad with a background style that matches the provided brand style guide (Asset 2) and generate no more than two human model from {{model_from_country}} showing the product. DO NOT use model from the the brand style guide (Asset 2). Adherence to the following rules is ABSOLUTE and NON-NEGOTIABLE.
                Provided Assets:
                    - Asset 1: A product photo.
                    - Asset 2: A brand style guide (contains fonts, colors, etc). You MUST extract the logo from this asset. Product Context: "{{product_description}}" This description provides context about the product. Use this information to inform the overall mood, background, and style of the ad, but DO NOT display this text in the ad itself unless it is also included in the headlines or features.
                Core Task:
                    Generate one image ad. Create a clean, professional, and visually appealing layout that follows modern design principles. The layout should complement the product and brand identity.
                NON-NEGOTIABLE DESIGN RULES:
                    1.  BACKGROUND FIRST: Create a new, clean, professional background for the ad. The background's color scheme and style MUST be exclusively derived from the provided brand style guide (Asset 2).
                    2.  PRODUCT PLACEMENT & REALISTIC PHYSICAL SCALE: Generate no more than two human models from {{model_from_country}} using the product in a daily life use case. The product must be the clear visual focal point through sharp focus, lighting, and medium close-up camera framing, while strictly maintaining 100% realistic real-world physical scale relative to the human hand and body (CRITICAL: NEVER make a perfume bottle, cosmetic, or handheld product oversized or giant relative to the model's hand; a bottle/cosmetic must fit naturally in one palm at authentic 8–12 cm real-world dimensions). Optionally display a clean studio packshot inset of Asset 1 in the bottom-right corner.
                    3.  STRICT SEPARATION (CRITICAL): The text elements and the product image MUST NOT overlap under any circumstances. There must be clear, visible space between the product and all text. Position the text in a dedicated area (e.g., to the side, above, or below the product)
                    4.  BRAND IDENTITY (CRITICAL):
                        - Colors: The ENTIRE ad's color palette (background, text, graphics) MUST strictly use the colors found in the guide (Asset 2).
                        - Typography: The font style for all text MUST be professional, legible, and derived from or complementary to the typography in the brand style guide (Asset 2).
                        - Logo: An official logo file is NOT provided. You MUST meticulously extract the company logo from the brand style guide (Asset 2). Ensure the extraction is clean and accurate. DO NOT use any logo from the product photo.
                    5.  TEXT SOURCE OF TRUTH (MOST CRITICAL RULE):
                        - The brand style guide (Asset 2) is for VISUAL styles reference ONLY. You MUST IGNORE ALL other text that is not the logo.
                        - The text provided below MUST be added to the final ad image EXACTLY. Do NOT add, remove, or alter it in any way. You may add other related highlighting text.
                        - Headlines: {{Headline}}
                        - Features: {{Feature}}
                        - Call to Action: {{CTA}}
                        - Any number in headlines added to the image should be highlighted to make them different from other text.
                    6.  FINAL QUALITY CHECK:
                        - The final image must be high-resolution and professional.
                        - No watermarks or artifacts.
                        - The product from the brand style guide (Asset 2) MUST NOT be present on the result image.
                        - All text must be perfectly legible. Number should be highlighted and different from other words.
                        - Only one Logo presents and MUST be at the top right corner of the image with clean margin. The logo should not be from the product photo.
                        - ABSOLUTELY NO text from the brand style guide (Asset 2) should be present on result images.
                        - The product (Asset 1) should be exactly the same as provided and strictly proportional to the human hand/body.
                        - Models from the brand style guide (Asset 2) MUST NOT be present on the result images.
                        - The product image added to the bottom right should use the product image provided (Asset 1)

                Failure to follow any of these rules, especially rule #6, is a complete failure. Generate the ad now, following these instructions with extreme precision.
            `,
        image_slots: [
          {asset_name: 'product_image', is_static: false},
          {asset_name: 'guideline_sample', is_static: false},
        ],
        text_variables: [
          {
            name: 'product_description',
            default_value: 'Simple product description here...',
          },
          {
            name: 'model_from_country',
            default_value: 'e.g., Brazil, California',
          },
          {
            name: 'Headline',
            default_value: 'e.g. Up to 30% off!',
          },
          {
            name: 'Feature',
            default_value: 'e.g. Freeshipping Any Where',
          },
          {
            name: 'CTA',
            default_value: 'e.g. Shop Now!',
          },
        ],
      },
    ],
  },
  {
    id: 'brand-guideline-based-multi-product-image-generation',
    name: '多产品组合大片 (Multi-Product Combo)',
    description: '支持在单一商业构图中协同放置多个产品，自适应透视、阴影投射与空间景深关系，适合套装促销。',
    previewImage: TEMPLATE_VISUALS.multiProduct,
    category: 'retail',
    badge: '📦 套装组合',
    aspect_ratio: '16:9',
    genai_model: DEFAULT_IMAGE_MODEL,
    steps: [
      {
        name: 'Step 1: Generate Product Image Based On Sample Guideline',
        text_prompt: `
                You are an expert promotional graphic designer with a deep understanding of cultural and regional diversity.
                Your task is to create a new promotional image that perfectly simulates the visual style, color palette, and typography of the provided style reference image (Asset 1).

                The new image MUST adhere to the following strict requirements:

                1.  Logo Handling:
                    ·   You MUST identify and accurately extract any logo present in the style reference image (Asset 1).
                    ·   This extracted logo MUST be integrated seamlessly and tastefully onto the new promotional graphic.
                    ·   The logo's placement should be professional, respecting visual hierarchy, and should not obscure key elements like the model's face or the main product.
                    ·   The logo MUST be placed at the top right corner of the result image.

                2.  Text Content:
                    ·   It must legibly include the following text elements. Any numbers in the headline or feature should be highlighted (e.g., larger font, bold, different color, or a combination). DO NOT use '*' for highlighting.
                    ·   Headline: "{{Headline}}"
                    ·   Feature: "{{Feature}}"
                    ·   Call to Action: "{{CTA}}"

                3.  Human Model and Product Interaction:
                    ·   It is absolutely critical that the image features a real human model representative of the specified region: {{model_from_country}}. Pay close attention to this requirement to ensure accurate and respectful representation.
                    ·   The model should be realistically using, holding, or presenting "Product 1" (Asset 2).
                    ·   Crucially, "Product 1" (Asset 2) must be the primary visual focal point of the interaction through focus and framing, while strictly maintaining authentic real-world physical scale relative to the model's hand and body (NEVER artificially oversize handheld bottles or cosmetics).

                4.  Product Display:
                    ·   All three products must be clearly visible and sharply detailed in the final graphic.
                    ·   "Product 1" is featured with the model as described above.
                    ·   ALL "Product 1" (Asset 2)and "Product 2" (Asset 3)and "Product 3" (Asset 4) MUST each be displayed in their own separate, prominent showcase frames/pedestals.

                5.  Strict Text Rule:
                    ·   DO NOT add any extra text to the result images other than the provided Headline, Feature, and Call to Action.
                    ·   The product should be exactly the same as provided.
                    ·   For result image, there MUST be 3 placeholders containing product in a prominent style and a human model with realistic-scale product interaction.
                    ·   Human Model should outside of 3 placeholders presenting Product 1 (Asset 2).

                Do not include the original reference style image in the final output; only use it for styling guidance. The final image should be a high-quality, seamless composition that looks like a professional advertisement.
            `,
        image_slots: [
          {asset_name: 'guideline_sample', is_static: false},
          {asset_name: 'product_image1', is_static: false},
          {asset_name: 'product_image2', is_static: false},
          {asset_name: 'product_image3', is_static: false},
        ],
        text_variables: [
          {
            name: 'model_from_country',
            default_value: 'e.g., Brazil, California',
          },
          {
            name: 'Headline',
            default_value: 'e.g. Up to 30% off!',
          },
          {
            name: 'Feature',
            default_value: 'e.g. Freeshipping Any Where',
          },
          {
            name: 'CTA',
            default_value: 'e.g. Shop Now!',
          },
        ],
      },
    ],
  },
  {
    id: 'holiday-season',
    name: '节日大促与季节营销 (Holiday Season)',
    description: '为商品赋予黑五、圣诞、新年节日氛围视觉背景、礼品包装元素与节日质感光效。',
    previewImage: TEMPLATE_VISUALS.holidaySeason,
    category: 'holiday',
    badge: '🎁 节日大促',
    aspect_ratio: '1:1',
    genai_model: DEFAULT_IMAGE_MODEL,
    steps: [
      {
        name: 'Step 1: Generate Product Image Based On Sample Guideline',
        text_prompt: `
                You are a meticulous and highly skilled digital ad designer. Your sole purpose is to create a single, professional digital ad with a background style that matches the provided brand style guide (Asset 2) and generate no more than two human model from {{model_from_country}} showing the product. DO NOT use model from the the brand style guide (Asset 2). Adherence to the following rules is ABSOLUTE and NON-NEGOTIABLE.
                Provided Assets:
                    - Asset 1: A product photo.
                    - Asset 2: A brand style guide (contains fonts, colors, etc). You MUST extract the logo from this asset. Product Context: "{{product_description}}" This description provides context about the product. Use this information to inform the overall mood, background, and style of the ad, but DO NOT display this text in the ad itself unless it is also included in the headlines or features.
                Core Task:
                    Generate one image ad. Create a clean, professional, and visually appealing layout that follows modern design principles. The layout should complement the product and brand identity.
                NON-NEGOTIABLE DESIGN RULES:
                    1.  BACKGROUND FIRST: Create a new, clean, professional background for the ad. The background's color scheme and style MUST be exclusively derived from the provided brand style guide (Asset 2).
                    2.  PRODUCT PLACEMENT & REALISTIC PHYSICAL SCALE: Generate no more than two human models from {{model_from_country}} using the product in a daily life use case. The product must be the clear visual focal point through sharp focus, lighting, and medium close-up camera framing, while strictly maintaining 100% realistic real-world physical scale relative to the human hand and body (CRITICAL: NEVER make a perfume bottle, cosmetic, or handheld product oversized or giant relative to the model's hand; a bottle/cosmetic must fit naturally in one palm at authentic 8–12 cm real-world dimensions). Optionally display a clean studio packshot inset of Asset 1 in the bottom-right corner.
                    3.  STRICT SEPARATION (CRITICAL): The text elements and the product image MUST NOT overlap under any circumstances. There must be clear, visible space between the product and all text. Position the text in a dedicated area (e.g., to the side, above, or below the product)
                    4.  BRAND IDENTITY (CRITICAL):
                        - Colors: The ENTIRE ad's color palette (background, text, graphics) MUST strictly use the colors found in the guide (Asset 2).
                        - Typography: The font style for all text MUST be professional, legible, and derived from or complementary to the typography in the brand style guide (Asset 2).
                        - Logo: An official logo file is NOT provided. You MUST meticulously extract the company logo from the brand style guide (Asset 2). Ensure the extraction is clean and accurate. DO NOT use any logo from the product photo.
                    5.  TEXT SOURCE OF TRUTH (MOST CRITICAL RULE):
                        - The brand style guide (Asset 2) is for VISUAL styles reference ONLY. You MUST IGNORE ALL other text that is not the logo.
                        - The text provided below MUST be added to the final ad image EXACTLY. Do NOT add, remove, or alter it in any way. You may add other related highlighting text.
                        - Headlines: {{Headline}}
                        - Features: {{Feature}}
                        - Call to Action: {{CTA}}
                        - Any number in headlines added to the image should be highlighted to make them different from other text.
                    6.  FINAL QUALITY CHECK:
                        - The final image must be high-resolution and professional.
                        - No watermarks or artifacts.
                        - The product from the brand style guide (Asset 2) MUST NOT be present on the result image.
                        - All text must be perfectly legible. Number should be highlighted and different from other words.
                        - Only one Logo presents and MUST be at the top right corner of the image with clean margin. The logo should not be from the product photo.
                        - ABSOLUTELY NO text from the brand style guide (Asset 2) should be present on result images.
                        - The product (Asset 1) should be exactly the same as provided and strictly proportional to the human hand/body.
                        - Models from the brand style guide (Asset 2) MUST NOT be present on the result images.
                        - The product image added to the bottom right should use the product image provided (Asset 1)

                Failure to follow any of these rules, especially rule #6, is a complete failure. Generate the ad now, following these instructions with extreme precision.
            `,
        image_slots: [
          {asset_name: 'product_image', is_static: false},
          {asset_name: 'guideline_sample', is_static: false},
        ],
        text_variables: [
          {
            name: 'model_from_country',
            default_value: 'e.g., Brazil, California',
          },
          {
            name: 'Headline',
            default_value: 'e.g. Up to 30% off!',
          },
          {
            name: 'Feature',
            default_value: 'e.g. Freeshipping Any Where',
          },
          {
            name: 'CTA',
            default_value: 'e.g. Shop Now!',
          },
        ],
      },
      {
        name: 'Step 2: Generate Image For a Holiday Season',
        text_prompt: `
                Add {{holiday_season}} Shopping season element to the image, do not block original logo, product, model and text.
            `,
        image_slots: [],
        text_variables: [
          {
            name: 'holiday_season',
            default_value: 'e.g. Christmas, Black Friday',
          },
        ],
      },
    ],
  },
  {
    id: 'Text_only_with_model',
    name: '文案驱动模特大片 (Text to Model Ad)',
    description: '无需底图，仅通过文字描述（品类、模特动作、场景氛围）即可一键从零生成高质量商用模特广告图。',
    previewImage: TEMPLATE_VISUALS.textToModel,
    category: 'text',
    badge: '💡 纯文生图',
    aspect_ratio: '16:9',
    genai_model: DEFAULT_IMAGE_MODEL,
    steps: [
      {
        name: 'Step 1: Generate',
        text_prompt: `You are an ads Creative Specialist. Your task is to generate an ad image for {{Country}} market with no product but 2-3 local human model and some promotional elements. You will be given one reference style guideline image (Asset 1). From this guideline image, carefully extract the logo and put it onto your result image. The logo MUST be exactly the same as the style guideline image (Asset 1). For styling and layout of result image, follow rules below:
1. Any product on the style guideline image MUST NOT appear on the result image and also you MUST NOT generate any product as well.
2. The overall styling like background color, text font should be similar to styling guideline (Asset 1).
3. There MUST be 2 - 3 human model from {{Country}} in the result image.
4. The logo should be exactly the same as the style guideline image (Asset 1)

You are also provided with some text element including headline: {{Headline}}, feature: {{Feature}}, cta: {{CTA}}. For text elements, follow the rule:
1. Provided headline, feature and cta MUST be put on the result image in a correct way.
2. You should also add additional text like text from style guideline (Asset 1) to the result image relative to the content.
3. Any number in the headline and feature should be highlighted (e.g. Bold, Different Color, etc) from other text.
4. Make CTA button-like.
`,
        image_slots: [{asset_name: 'template_image', is_static: false}],
        text_variables: [
          {
            name: 'Country',
            default_value: 'United States',
          },
          {
            name: 'Headline',
            default_value: '30% Off Any Order',
          },
          {
            name: 'Feature',
            default_value: 'Great Buy',
          },
          {
            name: 'CTA',
            default_value: 'SHOP NOW',
          },
        ],
      },
    ],
  },
  {
    id: 'Text_only',
    name: '纯文本创意直出 (Pure Text to Ad)',
    description: '根据自然语言描述全流程生成商业摄影级静物大片与广告信息流素材，适合快速验证灵感。',
    previewImage: TEMPLATE_VISUALS.textOnly,
    category: 'text',
    badge: '⚡ 极速出图',
    aspect_ratio: '16:9',
    genai_model: DEFAULT_IMAGE_MODEL,
    steps: [
      {
        name: 'Step 1: Generate',
        text_prompt: `You are an ads Creative Specialist. Your task is to generate an ad image {{Country}} market with no product but only promotional text elements. You will be given one reference style guideline image (Asset 1). From this guideline image, carefully extract the logo and put it onto your result image. The logo MUST be exactly the same as the style guideline image (Asset 1). For styling and layout of result image, follow rules below:
1. Any product on the style guideline image MUST NOT appear on the result image and also you MUST NOT generate any product as well.
2. The overall styling like background color, text font should be similar to styling guideline (Asset 1).
3. The logo should be exactly the same as the style guideline image (Asset 1).
4. There should be only text and logo in the result image. DO NOT add any human model from style guideline image (Asset 1) to the result image.

You are also provided with some text element including headline: {{Headline}}, feature: {{Feature}}, cta: {{CTA}}. For text elements, follow the rule:
1. Provided headline, feature and cta MUST be put on the result image in a correct way.
2. You should also add additional text like text from style guideline (Asset 1) to the result image relative to the content.
3. Any number in the headline and feature should be highlighted (e.g. Bold, Different Color, etc) from other text.
4. Make CTA button-like.
`,
        image_slots: [{asset_name: 'template_image', is_static: false}],
        text_variables: [
          {
            name: 'Country',
            default_value: 'United States',
          },
          {
            name: 'Headline',
            default_value: '30% Off Any Order',
          },
          {
            name: 'Feature',
            default_value: 'Great Buy',
          },
          {
            name: 'CTA',
            default_value: 'SHOP NOW',
          },
        ],
      },
    ],
  },
  {
    id: 'basic_version',
    name: '标准商品静物精修 (Studio Product Shot)',
    description: '极简纯净影棚光影，高清凸显商品材质、纹理、按键与五金质感，适合电商详情页与主图。',
    previewImage: TEMPLATE_VISUALS.studioProduct,
    category: 'retail',
    badge: '📸 影棚精修',
    aspect_ratio: '16:9',
    genai_model: DEFAULT_IMAGE_MODEL,
    steps: [
      {
        name: 'Step 1: Generate',
        text_prompt: `# ROLE & GOAL
You are an expert AI Art Director. Your goal is to create one professional, high-quality digital image ad using the provided assets and instructions.

# ASSETS
You will be provided with three images and optional text copy.
- **ASSET 1: Product/Lifestyle Photo:** The main visual for the ad.
- **ASSET 2: Brand Style Guide/Ad Template:** A reference for style ONLY.
- **ASSET 3: Brand Logo:** The official brand logo.
- **Ad Copy:**
HEADLINE: "{{Headline}}",
DESCRIPTION: "{{Description}}",
Call to Action: "{{CTA}}",

# CREATIVE DIRECTION
For this specific ad, follow this direction: **High-Fidelity Template Adaptation:** Your primary goal is to recreate the "Brand Style Guide/Ad Template" (ASSET 2) using the provided new assets.
    1.  Analyze the template's layout: the positioning, scale, and alignment of its core components (image areas, text area, logo placement).
    2.  **CRITICAL** Construct a new ad that mirrors this *structure and style*, but is replaced entirely with the new assets (ASSET 1 + ASSET 3 + user provided Ad Copy). REMOVE AND DO NOT INCLUDE any original text or ad copy, logo or images from the template (ASSET 2).
    3.  The final ad should still feel like it perfectly fits within the brand's established design system.

# EXECUTION RULES
Follow these rules meticulously.

### 1. How to Use the Style Guide (ASSET 2)
- **USE ONLY THE STYLE:** Extract and use only the stylistic elements from ASSET 2:
    - Color palette
    - Typography (font styles, weights)
    - General layout and design ideas (shapes, patterns).
- **DO NOT USE THE CONTENT (CRITICAL):** You are strictly forbidden from using any of the original *content* from ASSET 2. All of the following must be completely removed and ignored:
    - **Any logos.**
    - **Any text and ad copy.**
    - **Any existing products.**
    - **Any images.**
- The final ad must be a new creation inspired only by the *style* of ASSET 2.

### 2. Image Integration (ASSET 1)
- **If ASSET 1 is a Product Photo (on a simple background):** Cleanly isolate the product and place it into your new ad composition at authentic real-world physical proportions (never artificially oversized relative to any person or prop).
- **If ASSET 1 is a Lifestyle Photo:** Your goal is to create a visually engaging lifestyle ad that promotes the product within the photo by using one of the two methods below:
  - ** Method 1:** Outpainting.** Seamlessly extend the photo's actual content (outpainting) to fill the relevant space or entire canvas. Make it look like one continuous photo.
  - ** Method 2:** If outpainting is not feasible or looks unnatural with the provided Brand Guide/Ad Template (ASSET 2), you may creatively isolate the key person along with the product, and use graphical elements, colors, and textures inspired by the "Brand Style Guide/Ad Template" (ASSET 2) to create a cohesive, well-designed ad.
- **Do not alter the product** within the photo.

### 3. Logo Integration (ASSET 3)
- **CRITICAL RULE:** Treat ASSET 3 (the Brand Logo) as an immutable digital asset. It MUST be placed directly onto the final ad without ANY modification.
- **DO NOT RE-DRAW, RE-INTERPRET, OR TRACE THE LOGO.** You are strictly forbidden from altering the logo's pixels. This includes its colors, shape, proportions, and design elements. It must be a perfect copy with a 100% transparent background and no rectangular box.
- **VISIBILITY IS KEY (CRITICAL):** Place the logo cleanly in the **top-right corner** with balanced margins (or an upper corner with maximum contrast). The logo **must** be clearly legible against its immediate background.
- Ensure the logo is legible but not dominant, occupying roughly 10-15% of the canvas width.

### 4. Text Integration

- Render the provided ad copy using the typography found in the "Brand Style Guide" (ASSET 2).
- If a copy element like 'Description' is not provided in the list above, do not invent one or create a placeholder for it.
- Ensure all text is perfectly legible with high contrast against its background.
- Use only the exact ad copy provided. Do not add, omit, or change any words.
:
- **Create Natural Negative Space:** Since ad copy is skipped, design a visually complete ad with clean, uncluttered areas where text and ad copy could be added in later. This space should be an organic part of the design.
- **NO PLACEHOLDERS (CRITICAL):** Do not create any shapes that look like text placeholders (e.g., empty boxes or rectangles). Also, do not attempt to add your own text since no copy is explicitely provided. The ad must look like a polished, text-free visual, that is ready for the end user to add their own copy at a later stage.


# FINAL QUALITY CHECK
Before finishing, verify:
1.  **No Obstruction:** No text, graphical elements, or logos cover any human faces or the product in the final image ad.
2.  **Professional Finish:** The ad is clean, sharp, and high-resolution. It should look like a digital image ad that is professionally designed with well composed and placed visual elements.
3.  **NO solid borders:** The ad MUST NOT have any odd solid borders at the sides or top/bottom.
4.  **Asset Integrity:** The brand logo (ASSET 3) is an exact, pixel-for-pixel copy of the provided asset and has not been distorted or re-drawn. The product within the main photo (ASSET 1) is also completely unaltered.
5.  **Rule Compliance:** You have followed all the execution rules above.

`,
        image_slots: [
          {asset_name: 'product_image', is_static: false},
          {asset_name: 'template_image', is_static: false},
          {asset_name: 'logo_image', is_static: false},
        ],
        text_variables: [
          {
            name: 'Headline',
            default_value: 'Hot Deals',
          },
          {
            name: 'Description',
            default_value: 'Discover the Latest Trends',
          },
          {
            name: 'CTA',
            default_value: 'SHOP NOW',
          },
        ],
      },
    ],
  },
  {
    id: 'ad-image-resizer',
    name: '智能广告尺寸重构 (Ad Image Resizer)',
    description: '一键将商品主体图自适应扩展与智能重构至 Google Ads 6 大标准投放版位（970x250, 300x600, 300x250 等）。',
    previewImage: TEMPLATE_VISUALS.adResizer,
    category: 'resize',
    badge: '📐 6大版位自适应',
    aspect_ratio: '1:1',
    genai_model: DEFAULT_IMAGE_MODEL,
    steps: [
      {
        name: 'Step 1: Generate Base Image with Gemini',
        text_prompt: `Intelligently adapt and resize the product from Asset 1 to perfectly fit the dimensions and layout suggested by Asset 2 (the placeholder). The final image must be a professional advertisement of the specified size.

**Key Layout Rules:**
* **Product Placement:** Keep the main product centered, sharp, and naturally integrated, preserving its original quality.
* **Background:** Ensure the background fills the entire new dimensions seamlessly.
* **Native Elements:** If Asset 1 contains existing logo and text overlays, rearrange these native elements and the layout to adapt to the new specified size.

**Strict Restrictions:**
* **No New Additions:** Apart from the native elements already present in Asset 1, do not add any new text overlays, logos, watermarks, or extra graphic elements.`,
        image_slots: [
          {asset_name: 'product_image', is_static: false},
          {asset_name: 'placeholder', is_static: true},
        ],
        text_variables: [],
      },
      {
        name: 'Step 2: Precisely Auto-Crop to Target Pixels',
        text_prompt: 'System will automatically crop and fit the generated image perfectly to your selected sizes in Step 1.',
        image_slots: [],
        text_variables: [],
      },
    ],
  },
];
