"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StabilityAiApi = void 0;
class StabilityAiApi {
    constructor() {
        this.name = 'stabilityAiApi';
        this.displayName = 'Stability AI API';
        this.documentationUrl = 'https://platform.stability.ai/docs/getting-started/authentication';
        this.properties = [
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
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.apiKey}}',
                },
            },
        };
    }
}
exports.StabilityAiApi = StabilityAiApi;
