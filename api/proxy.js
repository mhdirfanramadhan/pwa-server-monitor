module.exports = async (req, res) => {
  // Set CORS headers to allow requests from your PWA
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const targetUrl = "https://test.kreasibisnisdigital.com/";

  try {
    const startTime = Date.now();

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "PWA-Server-Monitor/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 10000, // 10 second timeout
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Get response text
    const responseText = await response.text();

    // Determine if server is considered "active" based on status code
    const isServerActive = response.status >= 200 && response.status < 400;

    let errorMessage = null;
    if (!isServerActive) {
      switch (response.status) {
        case 502:
          errorMessage = "Bad Gateway";
          break;
        case 503:
          errorMessage = "Service Unavailable";
          break;
        case 504:
          errorMessage = "Gateway Timeout";
          break;
        case 500:
          errorMessage = "Internal Server Error";
          break;
        case 404:
          errorMessage = "Not Found";
          break;
        case 403:
          errorMessage = "Forbidden";
          break;
        case 401:
          errorMessage = "Unauthorized";
          break;
        default:
          errorMessage = `HTTP ${response.status} ${response.statusText}`;
      }
    }

    // Return JSON response with server status info
    res.status(200).json({
      success: isServerActive,
      status: response.status,
      statusText: response.statusText,
      responseTime: responseTime,
      timestamp: new Date().toISOString(),
      serverUrl: targetUrl,
      contentLength: responseText.length,
      headers: Object.fromEntries(response.headers.entries()),
      error: errorMessage,
    });
  } catch (error) {
    console.error("Proxy error:", error);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Return error response with details
    res.status(200).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      serverUrl: targetUrl,
      responseTime: responseTime,
      status: null,
      statusText: null,
    });
  }
};
