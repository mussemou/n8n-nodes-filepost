import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

export class FilePost implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FilePost',
		name: 'filePost',
		icon: 'file:filepost.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Uploads files and returns public URLs',
		defaults: {
			name: 'FilePost',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'filePostApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Upload File',
						value: 'upload',
						description: 'Uploads a file and returns a public URL',
						action: 'Upload file',
					},
					{
						name: 'List Files',
						value: 'list',
						description: 'Lists uploaded files',
						action: 'List files',
					},
					{
						name: 'Get File',
						value: 'get',
						description: 'Gets details for a specific file',
						action: 'Get file details',
					},
					{
						name: 'Delete File',
						value: 'delete',
						description: 'Deletes a file',
						action: 'Delete file',
					},
				],
				default: 'upload',
			},
			// Upload fields
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						operation: ['upload'],
					},
				},
				description: 'Name of the binary property containing the file to upload',
			},
			// Get/Delete fields
			{
				displayName: 'File ID',
				name: 'fileId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['get', 'delete'],
					},
				},
				description: 'The ID of the file',
			},
			// List fields
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
				description: 'Page number',
			},
			{
				displayName: 'Per Page',
				name: 'perPage',
				type: 'number',
				default: 50,
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
				description: 'Number of results per page (max 100)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		const baseUrl = 'https://filepost.dev/v1';

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'upload') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

					let fileName = binaryData.fileName;
					const mimeType = binaryData.mimeType || 'application/octet-stream';
					if (!fileName || !fileName.includes('.')) {
						const ext = mimeType.split('/')[1]?.split(';')[0] || 'bin';
						fileName = `upload.${ext}`;
					}

					const formData = new FormData();
					formData.append('file', new Blob([new Uint8Array(buffer)], { type: mimeType }), fileName);

					const response = await this.helpers.httpRequestWithAuthentication.call(this, 'filePostApi', {
						method: 'POST',
						url: `${baseUrl}/upload`,
						body: formData,
						json: true,
					});

					returnData.push({ json: response as any });

				} else if (operation === 'list') {
					const page = this.getNodeParameter('page', i) as number;
					const perPage = this.getNodeParameter('perPage', i) as number;

					const response = await this.helpers.httpRequestWithAuthentication.call(this, 'filePostApi', {
						method: 'GET',
						url: `${baseUrl}/files`,
						qs: { page, per_page: perPage },
						json: true,
					});

					returnData.push({ json: response as any });

				} else if (operation === 'get') {
					const fileId = this.getNodeParameter('fileId', i) as string;

					const response = await this.helpers.httpRequestWithAuthentication.call(this, 'filePostApi', {
						method: 'GET',
						url: `${baseUrl}/files/${fileId}`,
						json: true,
					});

					returnData.push({ json: response as any });

				} else if (operation === 'delete') {
					const fileId = this.getNodeParameter('fileId', i) as string;

					const response = await this.helpers.httpRequestWithAuthentication.call(this, 'filePostApi', {
						method: 'DELETE',
						url: `${baseUrl}/files/${fileId}`,
						json: true,
					});

					returnData.push({ json: response as any });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
