import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class FilePost implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FilePost',
		name: 'filePost',
		icon: 'file:filepost.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Upload files and get public URLs instantly',
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
						description: 'Upload a file and get a public URL',
						action: 'Upload a file',
					},
					{
						name: 'List Files',
						value: 'list',
						description: 'List your uploaded files',
						action: 'List files',
					},
					{
						name: 'Get File',
						value: 'get',
						description: 'Get details of a specific file',
						action: 'Get file details',
					},
					{
						name: 'Delete File',
						value: 'delete',
						description: 'Delete a file',
						action: 'Delete a file',
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
		const credentials = await this.getCredentials('filePostApi');
		const apiKey = credentials.apiKey as string;
		const baseUrl = 'https://filepost.dev/v1';

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'upload') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

					const formData = {
						file: {
							value: buffer,
							options: {
								filename: binaryData.fileName || 'file',
								contentType: binaryData.mimeType || 'application/octet-stream',
							},
						},
					};

					const response = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/upload`,
						headers: { 'X-API-Key': apiKey },
						formData,
						json: true,
					});

					returnData.push({ json: response });

				} else if (operation === 'list') {
					const page = this.getNodeParameter('page', i) as number;
					const perPage = this.getNodeParameter('perPage', i) as number;

					const response = await this.helpers.request({
						method: 'GET',
						url: `${baseUrl}/files?page=${page}&per_page=${perPage}`,
						headers: { 'X-API-Key': apiKey },
						json: true,
					});

					returnData.push({ json: response });

				} else if (operation === 'get') {
					const fileId = this.getNodeParameter('fileId', i) as string;

					const response = await this.helpers.request({
						method: 'GET',
						url: `${baseUrl}/files/${fileId}`,
						headers: { 'X-API-Key': apiKey },
						json: true,
					});

					returnData.push({ json: response });

				} else if (operation === 'delete') {
					const fileId = this.getNodeParameter('fileId', i) as string;

					const response = await this.helpers.request({
						method: 'DELETE',
						url: `${baseUrl}/files/${fileId}`,
						headers: { 'X-API-Key': apiKey },
						json: true,
					});

					returnData.push({ json: response });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
