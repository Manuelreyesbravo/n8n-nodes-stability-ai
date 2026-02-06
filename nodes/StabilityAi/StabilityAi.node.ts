import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class StabilityAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Stability AI',
		name: 'stabilityAi',
		icon: 'file:stability.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Generate, modify, upscale and inpaint images with Stability AI (Stable Diffusion)',
		defaults: { name: 'Stability AI' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'stabilityAiApi', required: true }],
		properties: [
			{ displayName: 'Resource', name: 'resource', type: 'options', noDataExpression: true, options: [
				{ name: 'Image', value: 'image' }, { name: 'Account', value: 'account' },
			], default: 'image' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['image'] } }, options: [
				{ name: 'Text to Image', value: 'textToImage', description: 'Generate image from text prompt', action: 'Generate image from text prompt' },
				{ name: 'Image to Image', value: 'imageToImage', description: 'Modify image with text prompt', action: 'Modify image with text prompt' },
				{ name: 'Upscale', value: 'upscale', description: 'Upscale image resolution', action: 'Upscale image resolution' },
				{ name: 'Masking', value: 'masking', description: 'Inpaint image using mask', action: 'Inpaint image using mask' },
			], default: 'textToImage' },
			{ displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } }, options: [
				{ name: 'Get Balance', value: 'getBalance', description: 'Get credit balance', action: 'Get credit balance' },
				{ name: 'Get Account', value: 'getAccount', description: 'Get account info', action: 'Get account info' },
				{ name: 'List Engines', value: 'listEngines', description: 'List available engines', action: 'List available engines' },
			], default: 'getBalance' },
			{ displayName: 'Engine', name: 'engineId', type: 'options',
				displayOptions: { show: { resource: ['image'] } }, options: [
				{ name: 'SDXL v1.0', value: 'stable-diffusion-xl-1024-v1-0' },
				{ name: 'SDXL v0.9', value: 'stable-diffusion-xl-1024-v0-9' },
				{ name: 'SD v1.6', value: 'stable-diffusion-v1-6' },
				{ name: 'ESRGAN x2 (Upscale)', value: 'esrgan-v1-x2plus' },
				{ name: 'SD x4 Latent Upscaler', value: 'stable-diffusion-x4-latent-upscaler' },
			], default: 'stable-diffusion-xl-1024-v1-0' },
			{ displayName: 'Prompt', name: 'prompt', type: 'string', typeOptions: { rows: 4 },
				displayOptions: { show: { resource: ['image'], operation: ['textToImage', 'imageToImage', 'masking'] } },
				default: '', required: true },
			{ displayName: 'Prompt Weight', name: 'promptWeight', type: 'number',
				typeOptions: { minValue: -1, maxValue: 1, numberStepSize: 0.1 },
				displayOptions: { show: { resource: ['image'], operation: ['textToImage', 'imageToImage', 'masking'] } },
				default: 1 },
			{ displayName: 'Negative Prompt', name: 'negativePrompt', type: 'string', typeOptions: { rows: 2 },
				displayOptions: { show: { resource: ['image'], operation: ['textToImage', 'imageToImage', 'masking'] } },
				default: '' },
			{ displayName: 'Input Image Field', name: 'inputImageField', type: 'string',
				displayOptions: { show: { resource: ['image'], operation: ['imageToImage', 'upscale', 'masking'] } },
				default: 'data', required: true },
			{ displayName: 'Mask Image Field', name: 'maskImageField', type: 'string',
				displayOptions: { show: { resource: ['image'], operation: ['masking'] } },
				default: 'mask', required: true },
			{ displayName: 'Mask Source', name: 'maskSource', type: 'options',
				displayOptions: { show: { resource: ['image'], operation: ['masking'] } }, options: [
				{ name: 'White Pixels', value: 'MASK_IMAGE_WHITE' },
				{ name: 'Black Pixels', value: 'MASK_IMAGE_BLACK' },
				{ name: 'Init Image Alpha', value: 'INIT_IMAGE_ALPHA' },
			], default: 'MASK_IMAGE_WHITE' },
			{ displayName: 'Image Strength', name: 'imageStrength', type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.05 },
				displayOptions: { show: { resource: ['image'], operation: ['imageToImage'] } },
				default: 0.35 },
			{ displayName: 'Width', name: 'width', type: 'options',
				displayOptions: { show: { resource: ['image'], operation: ['textToImage'] } }, options: [
				{ name: '512', value: 512 }, { name: '640', value: 640 }, { name: '768', value: 768 },
				{ name: '832', value: 832 }, { name: '896', value: 896 }, { name: '1024', value: 1024 },
				{ name: '1152', value: 1152 }, { name: '1216', value: 1216 }, { name: '1344', value: 1344 },
				{ name: '1536', value: 1536 },
			], default: 1024 },
			{ displayName: 'Height', name: 'height', type: 'options',
				displayOptions: { show: { resource: ['image'], operation: ['textToImage'] } }, options: [
				{ name: '512', value: 512 }, { name: '640', value: 640 }, { name: '768', value: 768 },
				{ name: '832', value: 832 }, { name: '896', value: 896 }, { name: '1024', value: 1024 },
				{ name: '1152', value: 1152 }, { name: '1216', value: 1216 }, { name: '1344', value: 1344 },
				{ name: '1536', value: 1536 },
			], default: 1024 },
			{ displayName: 'Target Width', name: 'upscaleWidth', type: 'number',
				typeOptions: { minValue: 512 },
				displayOptions: { show: { resource: ['image'], operation: ['upscale'] } },
				default: 2048 },
			{ displayName: 'CFG Scale', name: 'cfgScale', type: 'number',
				typeOptions: { minValue: 0, maxValue: 35, numberStepSize: 0.5 },
				displayOptions: { show: { resource: ['image'], operation: ['textToImage', 'imageToImage', 'masking'] } },
				default: 7 },
			{ displayName: 'Steps', name: 'steps', type: 'number',
				typeOptions: { minValue: 10, maxValue: 50 },
				displayOptions: { show: { resource: ['image'], operation: ['textToImage', 'imageToImage', 'masking'] } },
				default: 30 },
			{ displayName: 'Samples', name: 'samples', type: 'number',
				typeOptions: { minValue: 1, maxValue: 10 },
				displayOptions: { show: { resource: ['image'], operation: ['textToImage', 'imageToImage', 'masking'] } },
				default: 1 },
			{ displayName: 'Seed', name: 'seed', type: 'number',
				typeOptions: { minValue: 0, maxValue: 4294967295 },
				displayOptions: { show: { resource: ['image'], operation: ['textToImage', 'imageToImage', 'masking'] } },
				default: 0 },
			{ displayName: 'Sampler', name: 'sampler', type: 'options',
				displayOptions: { show: { resource: ['image'], operation: ['textToImage', 'imageToImage', 'masking'] } }, options: [
				{ name: 'Auto', value: '' }, { name: 'DDIM', value: 'DDIM' }, { name: 'DDPM', value: 'DDPM' },
				{ name: 'K_DPMPP_2M', value: 'K_DPMPP_2M' }, { name: 'K_DPMPP_2S_ANCESTRAL', value: 'K_DPMPP_2S_ANCESTRAL' },
				{ name: 'K_DPM_2', value: 'K_DPM_2' }, { name: 'K_DPM_2_ANCESTRAL', value: 'K_DPM_2_ANCESTRAL' },
				{ name: 'K_EULER', value: 'K_EULER' }, { name: 'K_EULER_ANCESTRAL', value: 'K_EULER_ANCESTRAL' },
				{ name: 'K_HEUN', value: 'K_HEUN' }, { name: 'K_LMS', value: 'K_LMS' },
			], default: '' },
			{ displayName: 'Style Preset', name: 'stylePreset', type: 'options',
				displayOptions: { show: { resource: ['image'], operation: ['textToImage', 'imageToImage', 'masking'] } }, options: [
				{ name: 'None', value: '' }, { name: 'Enhance', value: 'enhance' }, { name: 'Anime', value: 'anime' },
				{ name: 'Photographic', value: 'photographic' }, { name: 'Digital Art', value: 'digital-art' },
				{ name: 'Comic Book', value: 'comic-book' }, { name: 'Fantasy Art', value: 'fantasy-art' },
				{ name: 'Line Art', value: 'line-art' }, { name: 'Analog Film', value: 'analog-film' },
				{ name: 'Neon Punk', value: 'neon-punk' }, { name: 'Isometric', value: 'isometric' },
				{ name: 'Low Poly', value: 'low-poly' }, { name: 'Cinematic', value: 'cinematic' },
				{ name: '3D Model', value: '3d-model' }, { name: 'Pixel Art', value: 'pixel-art' },
				{ name: 'Tile Texture', value: 'tile-texture' },
			], default: '' },
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const ret: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const base = 'https://api.stability.ai';
		const creds = await this.getCredentials('stabilityAiApi');
		const apiKey = creds.apiKey as string;
		const headers = { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' };

		const processArtifacts = async (response: any): Promise<INodeExecutionData[]> => {
			const out: INodeExecutionData[] = [];
			for (const a of (response.artifacts || [])) {
				const bd = await this.helpers.prepareBinaryData(Buffer.from(a.base64, 'base64'), 'image.png', 'image/png');
				out.push({ json: { seed: a.seed, finishReason: a.finishReason }, binary: { data: bd } });
			}
			return out;
		};

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'account') {
					let ep = '/v1/user/balance';
					if (operation === 'getAccount') ep = '/v1/user/account';
					else if (operation === 'listEngines') ep = '/v1/engines/list';
					const r = await this.helpers.httpRequestWithAuthentication.call(this, 'stabilityAiApi', {
						method: 'GET', url: `${base}${ep}`, json: true,
					});
					ret.push(...this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(r as any), { itemData: { item: i } }));
				}

				else if (resource === 'image' && operation === 'textToImage') {
					const eid = this.getNodeParameter('engineId', i) as string;
					const body: any = {
						text_prompts: [{ text: this.getNodeParameter('prompt', i), weight: this.getNodeParameter('promptWeight', i) }],
						cfg_scale: this.getNodeParameter('cfgScale', i), width: this.getNodeParameter('width', i),
						height: this.getNodeParameter('height', i), steps: this.getNodeParameter('steps', i),
						samples: this.getNodeParameter('samples', i),
					};
					const neg = this.getNodeParameter('negativePrompt', i) as string;
					if (neg) body.text_prompts.push({ text: neg, weight: -1 });
					const seed = this.getNodeParameter('seed', i) as number;
					if (seed > 0) body.seed = seed;
					const sampler = this.getNodeParameter('sampler', i) as string;
					if (sampler) body.sampler = sampler;
					const style = this.getNodeParameter('stylePreset', i) as string;
					if (style) body.style_preset = style;

					const r = await this.helpers.httpRequestWithAuthentication.call(this, 'stabilityAiApi', {
						method: 'POST', url: `${base}/v1/generation/${eid}/text-to-image`, body, json: true,
					});
					ret.push(...(await processArtifacts(r)));
				}

				else if (resource === 'image' && operation === 'imageToImage') {
					const eid = this.getNodeParameter('engineId', i) as string;
					const imgField = this.getNodeParameter('inputImageField', i) as string;
					const bin = items[i].binary?.[imgField];
					if (!bin) throw new NodeOperationError(this.getNode(), `No binary data in "${imgField}"`, { itemIndex: i });
					const buf = await this.helpers.getBinaryDataBuffer(i, imgField);

					const formData = new FormData();
					formData.append('init_image', new Blob([buf], { type: bin.mimeType }), 'image.png');
					formData.append('init_image_mode', 'IMAGE_STRENGTH');
					formData.append('image_strength', String(this.getNodeParameter('imageStrength', i)));
					formData.append('text_prompts[0][text]', String(this.getNodeParameter('prompt', i)));
					formData.append('text_prompts[0][weight]', String(this.getNodeParameter('promptWeight', i)));
					formData.append('cfg_scale', String(this.getNodeParameter('cfgScale', i)));
					formData.append('steps', String(this.getNodeParameter('steps', i)));
					formData.append('samples', String(this.getNodeParameter('samples', i)));
					const neg = this.getNodeParameter('negativePrompt', i) as string;
					if (neg) { formData.append('text_prompts[1][text]', neg); formData.append('text_prompts[1][weight]', '-1'); }
					const seed = this.getNodeParameter('seed', i) as number;
					if (seed > 0) formData.append('seed', String(seed));
					const sampler = this.getNodeParameter('sampler', i) as string;
					if (sampler) formData.append('sampler', sampler);
					const style = this.getNodeParameter('stylePreset', i) as string;
					if (style) formData.append('style_preset', style);

					const r = await this.helpers.httpRequestWithAuthentication.call(this, 'stabilityAiApi', {
						method: 'POST', url: `${base}/v1/generation/${eid}/image-to-image`,
						body: formData, headers: { Accept: 'application/json' },
					});
					ret.push(...(await processArtifacts(r)));
				}

				else if (resource === 'image' && operation === 'upscale') {
					const eid = this.getNodeParameter('engineId', i) as string;
					const imgField = this.getNodeParameter('inputImageField', i) as string;
					const bin = items[i].binary?.[imgField];
					if (!bin) throw new NodeOperationError(this.getNode(), `No binary data in "${imgField}"`, { itemIndex: i });
					const buf = await this.helpers.getBinaryDataBuffer(i, imgField);

					const formData = new FormData();
					formData.append('image', new Blob([buf], { type: bin.mimeType }), 'image.png');
					formData.append('width', String(this.getNodeParameter('upscaleWidth', i)));

					const r = await this.helpers.httpRequestWithAuthentication.call(this, 'stabilityAiApi', {
						method: 'POST', url: `${base}/v1/generation/${eid}/image-to-image/upscale`,
						body: formData, headers: { Accept: 'application/json' },
					});
					ret.push(...(await processArtifacts(r)));
				}

				else if (resource === 'image' && operation === 'masking') {
					const eid = this.getNodeParameter('engineId', i) as string;
					const imgField = this.getNodeParameter('inputImageField', i) as string;
					const maskField = this.getNodeParameter('maskImageField', i) as string;
					const maskSrc = this.getNodeParameter('maskSource', i) as string;
					const binInit = items[i].binary?.[imgField];
					if (!binInit) throw new NodeOperationError(this.getNode(), `No binary data in "${imgField}"`, { itemIndex: i });
					const initBuf = await this.helpers.getBinaryDataBuffer(i, imgField);

					const formData = new FormData();
					formData.append('init_image', new Blob([initBuf], { type: binInit.mimeType }), 'image.png');
					formData.append('mask_source', maskSrc);
					formData.append('text_prompts[0][text]', String(this.getNodeParameter('prompt', i)));
					formData.append('text_prompts[0][weight]', String(this.getNodeParameter('promptWeight', i)));
					formData.append('cfg_scale', String(this.getNodeParameter('cfgScale', i)));
					formData.append('steps', String(this.getNodeParameter('steps', i)));
					formData.append('samples', String(this.getNodeParameter('samples', i)));

					if (maskSrc !== 'INIT_IMAGE_ALPHA') {
						const binMask = items[i].binary?.[maskField];
						if (!binMask) throw new NodeOperationError(this.getNode(), `No binary data in "${maskField}"`, { itemIndex: i });
						const maskBuf = await this.helpers.getBinaryDataBuffer(i, maskField);
						formData.append('mask_image', new Blob([maskBuf], { type: binMask.mimeType }), 'mask.png');
					}

					const neg = this.getNodeParameter('negativePrompt', i) as string;
					if (neg) { formData.append('text_prompts[1][text]', neg); formData.append('text_prompts[1][weight]', '-1'); }
					const seed = this.getNodeParameter('seed', i) as number;
					if (seed > 0) formData.append('seed', String(seed));
					const sampler = this.getNodeParameter('sampler', i) as string;
					if (sampler) formData.append('sampler', sampler);
					const style = this.getNodeParameter('stylePreset', i) as string;
					if (style) formData.append('style_preset', style);

					const r = await this.helpers.httpRequestWithAuthentication.call(this, 'stabilityAiApi', {
						method: 'POST', url: `${base}/v1/generation/${eid}/image-to-image/masking`,
						body: formData, headers: { Accept: 'application/json' },
					});
					ret.push(...(await processArtifacts(r)));
				}

			} catch (error) {
				if (this.continueOnFail()) { ret.push({ json: { error: (error as Error).message } }); continue; }
				throw error;
			}
		}
		return [ret];
	}
}
