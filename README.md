# n8n-nodes-stability-ai

This is an n8n community node for [Stability AI](https://stability.ai/) — the creators of Stable Diffusion.

Generate, modify, upscale, and inpaint images using the Stability AI REST API directly in your n8n workflows.

## Features

- **Text to Image** — Generate images from text prompts using SDXL and other engines
- **Image to Image** — Modify existing images with text prompts
- **Upscale** — Increase image resolution using ESRGAN or Latent Upscaler
- **Inpainting/Masking** — Selectively edit portions of an image using masks
- **Account** — Check balance and list available engines

## Authentication

This node uses API Key authentication. Get your key at [platform.stability.ai](https://platform.stability.ai/account/keys).

## Supported Models

- Stable Diffusion XL v1.0
- Stable Diffusion XL v0.9
- ESRGAN x2 Upscaler
- Stable Diffusion x4 Latent Upscaler
- And all engines available on your account

## Parameters

### Text to Image
- Prompt (text and weight)
- Engine (model selection)
- Width/Height
- CFG Scale, Steps, Sampler
- Style Preset (photographic, anime, digital-art, etc.)
- Samples, Seed

### Image to Image
- All text-to-image params plus init_image and image_strength

### Upscale
- Input image, target width or height

### Masking
- Init image, mask image, mask source
- All generation parameters

## Links

- [Stability AI API Docs](https://platform.stability.ai/docs/api-reference)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [LatamFlows](https://latamflows.com)

## License

MIT
