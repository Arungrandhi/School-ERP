export const saveSchoolLocation = async (
  req,
  res
) => {
  try {
    const { SchoolSettings } =
      req.tenantModels;

    const {
      latitude,
      longitude,
      allowedRadius,
    } = req.body;

    if (
      latitude == null ||
      longitude == null
    ) {
      return res.status(400).json({
        message:
          "Latitude and longitude are required",
      });
    }

    const settings =
      await SchoolSettings.findOneAndUpdate(
        {
          singleton: "SETTINGS",
        },
        {
          latitude,
          longitude,
          allowedRadius,
        },
        {
          upsert: true,
          new: true,
        }
      );

    res.json({
      message:
        "School location saved successfully",
      settings,
    });
  } catch (error) {
    console.error(
      "SAVE SCHOOL LOCATION ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================================
   GET SCHOOL LOCATION
========================================= */
export const getSchoolLocation = async (
  req,
  res
) => {
  try {
    const { SchoolSettings } =
      req.tenantModels;

    const settings =
      await SchoolSettings.findOne({
        singleton: "SETTINGS",
      });

    res.json(settings);
  } catch (error) {
    console.error(
      "GET SCHOOL LOCATION ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};