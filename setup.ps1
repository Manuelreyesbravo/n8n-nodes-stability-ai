$base = "C:\Users\manue\Proyectos\n8n-node\n8n-nodes-stability-ai"

# Credentials
$cred = @"
import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class StabilityAiApi implements ICredentialType {
	name = 'stabilityAiApi';
	displayName = 'Stability AI API';
	documentationUrl = 'https://platform.stability.ai/docs/getting-started/authentication';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Stability AI API key from platform.stability.ai',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{`$credentials.apiKey}}',
			},
		},
	};
}
"@
Set-Content -Path "$base\credentials\StabilityAiApi.credentials.ts" -Value $cred -Encoding UTF8
Write-Host "Created credentials"

# SVG Icon
$svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#7C3AED"/>
  <path d="M7 8h10M7 12h7M7 16h10" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
"@
Set-Content -Path "$base\nodes\StabilityAi\stability.svg" -Value $svg -Encoding UTF8
Write-Host "Created SVG"

# Codex
$codex = @"
{
	"node": "n8n-nodes-stability-ai.stabilityAi",
	"nodeVersion": "1.0",
	"codexVersion": "1.0",
	"categories": ["AI"],
	"subcategories": { "AI": ["Image Generation"] },
	"resources": {
		"primaryDocumentation": [{ "url": "https://platform.stability.ai/docs/api-reference" }]
	},
	"alias": ["stable diffusion", "image", "ai", "generate", "sdxl"]
}
"@
Set-Content -Path "$base\nodes\StabilityAi\StabilityAi.node.json" -Value $codex -Encoding UTF8
Write-Host "Created codex"

Write-Host "Done with small files"
