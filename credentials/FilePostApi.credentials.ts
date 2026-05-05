import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FilePostApi implements ICredentialType {
	name = 'filePostApi';
	displayName = 'FilePost API';
	documentationUrl = 'https://filepost.dev/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'fh_...',
			description: 'Your FilePost API key. Get one free at filepost.dev',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://filepost.dev/v1',
			url: '/account',
			method: 'GET',
		},
	};
}
