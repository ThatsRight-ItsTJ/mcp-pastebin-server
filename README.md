# MCP Pastebin Server

A Model Context Protocol (MCP) server for interacting with the Pastebin API, allowing AI assistants to create, read, and list pastes programmatically.

## Features

- 🔹 **Create Pastes**: Create public, unlisted, or private pastes with custom titles, content, and formatting
- 🔹 **Read Pastes**: Fetch the content of existing pastes by their key
- 🔹 **List Pastes**: Retrieve a list of user's pastes with pagination support
- 🔹 **Multiple Visibility Options**: Support for public, unlisted, and private pastes
- 🔹 **Format Support**: Specify syntax highlighting for different programming languages
- 🔹 **Error Handling**: Comprehensive error handling and timeout management

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mcp-pastebin-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file and add your Pastebin API credentials:
```env
PASTEBIN_API_KEY=your_api_key_here
PASTEBIN_USER_KEY=your_user_key_here  # Required for private/unlisted pastes and listing user pastes
```

## Configuration

### Pastebin API Setup

1. Get your API key from [Pastebin API settings](https://pastebin.com/api)
2. For private/unlisted pastes and listing user pastes, you'll need a user key:
   - Use the `api_login.php` endpoint with your username and password
   - Store the returned user key in your `.env` file

### MCP Client Configuration

Add this server to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "pastebin": {
      "command": "node",
      "args": ["src/index.js"]
    }
  }
}
```

## Usage

### Available Tools

#### 1. `create_paste`
Create a new paste on Pastebin.

**Parameters:**
- `title` (string, optional): Title of the paste
- `content` (string, required): Content of the paste
- `format` (string, optional): Format/language (e.g., javascript, python, text). Default: "text"
- `visibility` (string, optional): Visibility level. Options: "public", "unlisted", "private". Default: "public"

**Example:**
```json
{
  "title": "My Code Snippet",
  "content": "console.log('Hello, World!');",
  "format": "javascript",
  "visibility": "public"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://pastebin.com/abcdef123",
  "message": "Paste created successfully"
}
```

#### 2. `read_paste`
Read a paste from Pastebin by its key.

**Parameters:**
- `pasteKey` (string, required): The key of the paste to read

**Example:**
```json
{
  "pasteKey": "abcdef123"
}
```

**Response:**
```json
{
  "success": true,
  "content": "console.log('Hello, World!');",
  "pasteKey": "abcdef123",
  "url": "https://pastebin.com/abcdef123"
}
```

#### 3. `list_user_pastes`
List user's pastes from Pastebin.

**Parameters:**
- `limit` (number, optional): Maximum number of pastes to return (1-100). Default: 10

**Example:**
```json
{
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "pastes": [
    {
      "key": "abcdef123",
      "title": "My Code Snippet",
      "date": "2024-01-15 14:30:00",
      "size": "45 bytes",
      "url": "https://pastebin.com/abcdef123",
      "format": "javascript"
    }
  ],
  "count": 1,
  "message": "Found 1 pastes"
}
```

## API Endpoints

The server uses the following Pastebin API endpoints:
- `https://pastebin.com/api/api_post.php` - For creating, reading, and listing pastes
- `https://pastebin.com/api/api_login.php` - For user authentication (not directly exposed)

## Error Handling

The server includes comprehensive error handling for:
- Missing API credentials
- Invalid parameters
- Network timeouts
- Pastebin API rate limiting
- Authentication failures

Common error responses:
```json
{
  "error": "PASTEBIN_API_KEY environment variable is required"
}
```

```json
{
  "error": "Content is required"
}
```

```json
{
  "error": "Request timeout - Pastebin API may be rate limiting"
}
```

## Development

### Project Structure

```
mcp-pastebin-server/
├── src/
│   ├── index.js              # Entry point and MCP server setup
│   └── tools/
│       ├── createPaste.js    # Create paste functionality
│       ├── readPaste.js      # Read paste functionality
│       └── listPastes.js     # List user pastes functionality
├── package.json
├── glama.json
├── .env.example
└── README.md
```

### Running the Server

```bash
npm start
```

### Testing

The server can be tested with any MCP-compatible client. Ensure your `.env` file is properly configured with valid Pastebin API credentials.

## Dependencies

- `@la-rebelion/mcp-server`: MCP server framework
- `axios`: HTTP client for API requests
- `dotenv`: Environment variable management
- `zod`: Schema validation

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the error messages in the response
2. Verify your Pastebin API credentials
3. Ensure your network connection is stable
4. Check Pastebin API status for any service issues

## Future Enhancements

- Expiry control for pastes
- Enhanced syntax highlighting support
- Paste deletion functionality
- On-demand authentication tool
- Better rate limiting handling
- Cache for frequently accessed pastes