export const uploadFileToRepo = async (
  content: string,
  year: string,
  articleId: string,
  config: { token: string; owner: string; repo: string }
): Promise<string> => {
  const path = `en2/${year}/${articleId}.html`;
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  const base64Content = btoa(unescape(encodeURIComponent(content))); // robust unicode handling

  // 1. Check if file exists to get SHA (for updates) - Optional, here we might just overwrite or fail
  // For simplicity in this v1, we will attempt to create/overwrite. 
  // If we need to overwrite, we need the SHA of the existing file.
  
  let sha: string | undefined;
  
  try {
    const checkRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (checkRes.ok) {
        const data = await checkRes.json();
        sha = data.sha;
    }
  } catch (e) {
      // Ignore error if file doesn't exist
  }

  // 2. Upload
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Add article ${articleId} (${year}) via EnHub`,
      content: base64Content,
      sha: sha, // Include SHA if we are updating
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to upload to GitHub");
  }

  const data = await response.json();
  return data.content.html_url;
};
