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

  const targetUrl = "https://test.kreasibisnisdigital.com//";

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

    // Return JSON response with server status info
    res.status(200).json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      responseTime: responseTime,
      timestamp: new Date().toISOString(),
      serverUrl: targetUrl,
      contentLength: responseText.length,
      headers: Object.fromEntries(response.headers.entries()),
    });
  } catch (error) {
    console.error("Proxy error:", error);

    // Return error response with details
    res.status(200).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      serverUrl: targetUrl,
      responseTime: null,
    });
  }
};
