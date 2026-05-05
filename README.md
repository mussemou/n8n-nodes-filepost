# n8n-nodes-filepost

This is an [n8n](https://n8n.io/) community node for [FilePost](https://filepost.dev) — a file upload API that gives you instant public CDN URLs.

Upload any file from your n8n workflow and get back a permanent public URL. No S3 buckets, no storage config.

## Operations

| Operation | Description |
|-----------|-------------|
| **Upload File** | Upload a binary file and get a public CDN URL |
| **List Files** | List your uploaded files with pagination |
| **Get File** | Get details of a specific file by ID |
| **Delete File** | Delete a file by ID |

## Credentials

You need a FilePost API key. Get one free at [filepost.dev](https://filepost.dev).

1. Go to [filepost.dev](https://filepost.dev)
2. Enter your email to get a free API key
3. In n8n, go to **Credentials** > **New** > **FilePost API**
4. Paste your API key

## Installation

### In n8n (recommended)

1. Go to **Settings** > **Community Nodes**
2. Search for `n8n-nodes-filepost`
3. Click **Install**

### Manual

```bash
npm install n8n-nodes-filepost
```

## Usage Example

### Upload a file and get a URL

1. Add an **HTTP Request** or **Read Binary File** node to get a file
2. Connect it to the **FilePost** node
3. Set operation to **Upload File**
4. Set the binary property name (default: `data`)
5. Run — you get back a JSON response with `url`, `file_id`, `size`, and `content_type`

### Response example

```json
{
  "file_id": "abc123",
  "url": "https://cdn.filepost.dev/abc123/photo.jpg",
  "size": 248192,
  "content_type": "image/jpeg"
}
```

## Plans

| Plan | Price | Uploads/mo | Max File Size |
|------|-------|-----------|---------------|
| Free | $0 | 300 | 50MB |
| Starter | $9/mo | 5,000 | 200MB |
| Pro | $29/mo | 25,000 | 500MB |

## Links

- [FilePost Homepage](https://filepost.dev)
- [API Documentation](https://filepost.dev/docs)
- [Blog](https://filepost.dev/blog)

## License

[MIT](LICENSE)
