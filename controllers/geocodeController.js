/* =====================================================
   REVERSE GEOCODE PROXY
   Route: GET /api/geocode/reverse?lat=...&lon=...

   Keeps the LocationIQ API key safely on the backend.
   Frontend calls THIS endpoint — never LocationIQ directly.
===================================================== */

export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "lat and lon query params are required" });
    }

    const apiKey = process.env.LOCATIONIQ_API_KEY;

    if (!apiKey) {
      console.error("LOCATIONIQ_API_KEY is not set in .env");
      return res.status(500).json({ message: "Geocoding service is not configured." });
    }

    const url = `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${lat}&lon=${lon}&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      console.error("LocationIQ error:", errText);
      return res.status(502).json({ message: "Geocoding service returned an error.", detail: errText });
    }

    const data = await response.json();

    res.json({
      address: data.display_name || `${parseFloat(lat).toFixed(5)}, ${parseFloat(lon).toFixed(5)}`,
      raw: data // optional — remove if you want to minimize response size
    });

  } catch (error) {
    console.error("Reverse geocode proxy error:", error);
    res.status(500).json({ error: error.message });
  }
};
