import { ICredentialType, INodeProperties } from 'n8n-workflow';

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
}
