import axios from 'axios';
import https from 'https';
import { ENV_VARS } from '../config/enVars.js';

// Use HTTPS Agent to enforce modern TLS versions
const agent = new https.Agent({
  keepAlive: true,
  secureProtocol: 'TLS_method', // Forces TLSv1.2+
});

export const fetchFromTMDB = async (url) => {
  const options = {
    httpsAgent: agent, // ✅ Key fix for SSL
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + ENV_VARS.TMDB_API_KEY,
    },
  };

  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error) {
    console.error('Error fetching data from TMDB:', error.message);

    if (error.response) {
      console.error('TMDB Response:', error.response.status, error.response.data);
    }

    throw error;
  }
};
