import axios from 'axios';
import { config } from 'dotenv';
config();

const PASTEBIN_API_URL = 'https://pastebin.com/api/api_post.php';

/**
 * Create a paste on Pastebin
 * @param {Object} params - Tool parameters
 * @param {string} params.title - Title of the paste
 * @param {string} params.content - Content of the paste
 * @param {string} params.format - Format/language (optional)
 * @param {string} params.visibility - Visibility: 'public', 'unlisted', or 'private'
 * @returns {Promise<Object>} - Result containing URL or error message
 */
async function createPaste(params) {
  const { title, content, format = 'text', visibility } = params;
  
  // Validate required parameters
  if (!content) {
    return { error: 'Content is required' };
  }
  
  if (!visibility || !['public', 'unlisted', 'private'].includes(visibility)) {
    return { error: 'Visibility must be one of: public, unlisted, private' };
  }
  
  const apiDevKey = process.env.PASTEBIN_API_KEY;
  if (!apiDevKey) {
    return { error: 'PASTEBIN_API_KEY environment variable is required' };
  }
  
  // Prepare API parameters
  const formData = new URLSearchParams();
  formData.append('api_dev_key', apiDevKey);
  formData.append('api_option', 'paste');
  formData.append('api_paste_code', content);
  formData.append('api_paste_name', title || 'Untitled Paste');
  formData.append('api_paste_format', format);
  
  // Set visibility
  if (visibility === 'private') {
    const userKey = process.env.PASTEBIN_USER_KEY;
    if (!userKey) {
      return { error: 'PASTEBIN_USER_KEY environment variable is required for private pastes' };
    }
    formData.append('api_user_key', userKey);
    formData.append('api_paste_private', '1');
  } else if (visibility === 'unlisted') {
    formData.append('api_paste_private', '0');
  } else {
    formData.append('api_paste_private', '0');
  }
  
  try {
    const response = await axios.post(PASTEBIN_API_URL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });
    
    if (response.data.startsWith('Bad API request')) {
      return { error: `Pastebin API error: ${response.data}` };
    }
    
    if (response.data.startsWith('https://')) {
      return { 
        success: true, 
        url: response.data,
        message: 'Paste created successfully'
      };
    }
    
    return { error: `Unexpected response: ${response.data}` };
    
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return { error: 'Request timeout - Pastebin API may be rate limiting' };
    }
    
    return { 
      error: `Network error: ${error.message}`,
      details: error.response?.data || error.message
    };
  }
}

export { createPaste };