import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function validateGithubUrl(githubUrl) {
  if (!githubUrl || typeof githubUrl !== 'string') {
    throw new Error('Please enter a GitHub repository URL.')
  }

  try {
    const parsedUrl = new URL(githubUrl)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol')
    }

    if (!parsedUrl.hostname.includes('github.com')) {
      throw new Error('Not a GitHub URL')
    }

    const segments = parsedUrl.pathname.split('/').filter(Boolean)
    if (segments.length < 2) {
      throw new Error('Incomplete repository path')
    }

    return parsedUrl.toString()
  } catch {
    throw new Error('Please provide a valid GitHub repository URL, such as https://github.com/owner/repository.')
  }
}

export async function analyzeRepository(githubUrl) {
  const normalizedUrl = validateGithubUrl(githubUrl)

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, {
      github_url: normalizedUrl,
    })

    return response.data
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail)
    }

    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to reach the backend server. Make sure it is running on http://localhost:8000.')
    }

    if (error.response?.status === 400) {
      throw new Error('The repository URL could not be processed. Please verify it and try again.')
    }

    throw new Error('The analysis request failed. Please try again in a moment.')
  }
}
