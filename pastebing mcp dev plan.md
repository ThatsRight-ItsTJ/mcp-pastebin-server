Got it ✅ — let’s map out a development plan for an **MCP Server** (using [`@la-rebelion/mcp-server`](https://glama.ai/mcp/servers/%40la-rebelion/mcp-server?utm_source=chatgpt.com)) that integrates with the **Pastebin API** to:

* 🔹 Create **public** pastes
* 🔹 Create **private** (or unlisted) pastes
* 🔹 Read pastes

Here’s a structured dev plan:

---

# 🛠 Development Plan: Pastebin MCP Server
1.**Environment variables (`.env`)**
  Store sensitive info:

  ```
  PASTEBIN_API_KEY=your_dev_api_key
  PASTEBIN_USER_KEY=optional_user_key_for_private_pastes
  ```
* **Folder structure**

  ```
  mcp-pastebin-server/
  ├── src/
  │   ├── index.js          # Entry point
  │   ├── tools/
  │   │   ├── createPaste.js
  │   │   ├── readPaste.js
  │   │   └── listPastes.js (optional, if user API used)
  ├── .env
  ├── package.json
  └── glama.json
  ```

---

## 2. 🔐 Authentication Flow

* **Public pastes** require only `api_dev_key`.
* **Private/Unlisted pastes** require both `api_dev_key` + `api_user_key`.

  * `api_user_key` is obtained by calling `api_login.php` with a username + password once, then storing the key (best stored in `.env`).

---

## 3. 🧩 MCP Tool Definitions

Each tool must be registered with the MCP server (`server.addTool(...)`) and describe its schema.

### Tool 1: `create_paste`

* **Inputs:**

  ```json
  {
    "title": "string",
    "content": "string",
    "format": "string (optional, e.g. javascript, python)",
    "visibility": "string (public | unlisted | private)"
  }
  ```
* **Outputs:**

  * `url` of created paste or error message.

### Tool 2: `read_paste`

* **Inputs:**

  ```json
  {
    "pasteKey": "string"
  }
  ```
* **Outputs:**

  * Raw text content of the paste.

### Tool 3 (optional): `list_user_pastes`

* **Inputs:**

  ```json
  {
    "limit": "number (optional, default 10)"
  }
  ```
* **Outputs:**

  * Array of `{ title, key, date, size, url }`.

---

## 4. 🧑‍💻 Implementation Details

* Use **Axios** to call Pastebin’s API endpoints:

  * `https://pastebin.com/api/api_post.php` for creating & fetching.
  * `https://pastebin.com/api/api_login.php` for retrieving `api_user_key`.
* Implement retry/error handling (Pastebin rate-limits aggressively).
* Return **clean JSON responses** to MCP clients.

---

## 5. 🔌 MCP Server Setup (`index.js`)

* Initialize the server with `@la-rebelion/mcp-server`.
* Register tools (`createPaste`, `readPaste`, `listPastes`).
* Load `.env` with `dotenv`.
* Start listening (`server.start()`).

---

## 6. 📑 glama.json Metadata

Add `glama.json` for Glama indexing:

```json
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "maintainers": ["your-github-username"],
  "tools": ["create_paste", "read_paste", "list_user_pastes"]
}
```

---

## 7. 🔍 Testing & Validation

* Test locally with Claude Desktop / Cursor:

  * Add entry in `claude_desktop_config.json`:

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
* Try creating a paste → ensure URL returned works.
* Try reading a paste by key → raw content fetched.
* If using `list_user_pastes`, check private/unlisted access.

---

## 8. 🚀 Deployment & Hosting

* Push repo to **GitHub** with MIT license, README, and `glama.json`.
* Use Glama’s **MCP server directory** to register.
* Optionally deploy to a lightweight host (Glama ephemeral server slots, Vercel, or small Node server).

---

## 9. 📌 Future Enhancements

* Expiry control (`10M`, `1H`, `1D`, `1W`, `2W`, `1M`, `N`) for pastes.
* Syntax highlighting support (`format` field).
* Paste deletion (`api_option=delete`).
* Authentication tool for on-demand login.

---

Would you like me to **draft the actual `index.js` boilerplate code** for this Pastebin MCP server (with `create_paste` and `read_paste` implemented), so you can use it as a starting point?

