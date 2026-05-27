/* =====================================================
   ATTENDANCE CONTROLLER
===================================================== */

import { getDistance } from "geolib";

/* =====================================================
   MARK SINGLE ATTENDANCE
===================================================== */
export const markAttendance = async (
  req,
  res
) => {
  try {
    const {
      academicRecordId,
      date,
      session,
      status,
      punchInLocation,
    } = req.body;

    const { Attendance } =
      req.tenantModels;

    if (
      !academicRecordId ||
      !date ||
      !session ||
      !status
    ) {
      return res.status(400).json({
        message:
          "academicRecordId, date, session and status are required",
      });
    }

    const attendanceDate =
      new Date(date);

    attendanceDate.setHours(
      0,
      0,
      0,
      0
    );

    const updatePayload = {
      academicRecordId,
      date: attendanceDate,
      session,
      status,
    };

    if (
      punchInLocation &&
      punchInLocation.latitude != null &&
      punchInLocation.longitude != null
    ) {
      updatePayload.punchInLocation = {
        latitude:
          punchInLocation.latitude,

        longitude:
          punchInLocation.longitude,

        address:
          punchInLocation.address ||
          null,

        accuracy:
          punchInLocation.accuracy ||
          null,

        punchedAt:
          punchInLocation.punchedAt
            ? new Date(
              punchInLocation.punchedAt
            )
            : new Date(),
      };
    }

    const attendance =
      await Attendance.findOneAndUpdate(
        {
          academicRecordId,
          date: attendanceDate,
          session,
        },
        updatePayload,
        {
          new: true,
          upsert: true,
        }
      );

    res.status(201).json(
      attendance
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};




export const getAttendanceClasses =
  async (req, res) => {
    try {

      const { AcademicRecord } =
        req.tenantModels;

      const classes =
        await AcademicRecord.aggregate([
          {
            $match: {
              status: "ACTIVE",

              className: {
                $ne: "STAFF",
              },
            },
          },

          {
            $group: {
              _id: {
                className:
                  "$className",

                section:
                  "$section",
              },

              totalStudents: {
                $sum: 1,
              },
            },
          },

          {
            $project: {
              _id: 0,

              className:
                "$_id.className",

              section:
                "$_id.section",

              totalStudents: 1,
            },
          },

          {
            $sort: {
              className: 1,
              section: 1,
            },
          },
        ]);

      res.json(classes);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };




/* =====================================================
   BULK MARK ATTENDANCE
===================================================== */
export const bulkMarkAttendance =
  async (req, res) => {
    try {
      const {
        records,
        date,
        session,
        punchInLocation,
      } = req.body;

      const { Attendance } =
        req.tenantModels;

      if (
        !records ||
        !date ||
        !session
      ) {
        return res.status(400).json({
          message:
            "records, date and session required",
        });
      }

      const attendanceDate =
        new Date(date);

      attendanceDate.setUTCHours(
        0,
        0,
        0,
        0
      );

      let locationPayload = {};

      if (
        punchInLocation &&
        punchInLocation.latitude !=
        null &&
        punchInLocation.longitude !=
        null
      ) {
        locationPayload = {
          "punchInLocation.latitude":
            punchInLocation.latitude,

          "punchInLocation.longitude":
            punchInLocation.longitude,

          "punchInLocation.address":
            punchInLocation.address ||
            null,

          "punchInLocation.accuracy":
            punchInLocation.accuracy ||
            null,

          "punchInLocation.punchedAt":
            new Date(),
        };
      }

      const bulkOps = records.map(
        (r) => ({
          updateOne: {
            filter: {
              academicRecordId:
                r.academicRecordId,

              date: attendanceDate,

              session,
            },

            update: {
              $set: {
                status: r.status,

                academicRecordId:
                  r.academicRecordId,

                date: attendanceDate,

                session,

                ...locationPayload,
              },
            },

            upsert: true,
          },
        })
      );

      const result =
        await Attendance.bulkWrite(
          bulkOps
        );

      res.json({
        message:
          "Attendance saved successfully",

        result,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: error.message,
      });
    }
  };

/* =====================================================
   GET STUDENT ATTENDANCE
===================================================== */
export const getStudentAttendance =
  async (req, res) => {
    try {
      const {
        academicRecordId,
        startDate,
        endDate,
      } = req.query;

      const { Attendance } =
        req.tenantModels;

      if (!academicRecordId) {
        return res.status(400).json({
          message:
            "academicRecordId is required",
        });
      }

      let query = {
        academicRecordId,
      };

      if (startDate || endDate) {
        query.date = {};

        if (startDate) {
          query.date.$gte =
            new Date(startDate);
        }

        if (endDate) {
          query.date.$lte =
            new Date(endDate);
        }
      }

      const records =
        await Attendance.find(
          query
        ).sort({
          date: -1,
        });

      res.json(records);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: error.message,
      });
    }
  };

/* =====================================================
   GET CLASS ATTENDANCE
===================================================== */
export const getClassAttendance =
  async (req, res) => {
    try {
      const { date, session } =
        req.query;

      const { Attendance } =
        req.tenantModels;

      if (!date || !session) {
        return res.status(400).json({
          message:
            "date and session required",
        });
      }

      const attendanceDate =
        new Date(date);

      attendanceDate.setUTCHours(
        0,
        0,
        0,
        0
      );

      const records =
        await Attendance.find({
          date: attendanceDate,
          session,
        });

      res.json(records);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };

/* =====================================================
   MONTHLY SUMMARY
===================================================== */
export const getMonthlyAttendanceSummary =
  async (req, res) => {
    try {
      const {
        academicRecordId,
        month,
        year,
      } = req.query;

      const { Attendance } =
        req.tenantModels;

      const startDate = new Date(
        year,
        month - 1,
        1
      );

      const endDate = new Date(
        year,
        month,
        0
      );

      const records =
        await Attendance.find({
          academicRecordId,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        });

      const total =
        records.length;

      const present =
        records.filter(
          (r) =>
            r.status ===
            "PRESENT" ||
            r.status === "LATE"
        ).length;

      const percentage =
        total === 0
          ? 0
          : (
            (present / total) *
            100
          ).toFixed(2);

      res.json({
        totalDays: total,
        presentDays: present,
        percentage,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };

/* =====================================================
   STAFF PUNCH-IN
===================================================== */
export const staffPunchIn =
  async (req, res) => {
    try {
      const {
        academicRecordId,
        session,
        punchInLocation,
      } = req.body;

      const {
        Attendance,
        SchoolSettings,
      } = req.tenantModels;

      if (
        !academicRecordId ||
        !session
      ) {
        return res.status(400).json({
          message:
            "academicRecordId and session are required",
        });
      }

      if (
        !punchInLocation ||
        punchInLocation.latitude ==
        null ||
        punchInLocation.longitude ==
        null
      ) {
        return res.status(400).json({
          message:
            "Valid punchInLocation required",
        });
      }

      if (
        punchInLocation.accuracy &&
        punchInLocation.accuracy >
        100
      ) {
        return res.status(400).json({
          message:
            "GPS accuracy too low",
        });
      }

      const schoolSettings =
        await SchoolSettings.findOne(
          {
            singleton:
              "SETTINGS",
          }
        );

      if (!schoolSettings) {
        return res.status(400).json({
          message:
            "School geo-fence not configured",
        });
      }

      const distance =
        getDistance(
          {
            latitude:
              schoolSettings.latitude,

            longitude:
              schoolSettings.longitude,
          },
          {
            latitude:
              punchInLocation.latitude,

            longitude:
              punchInLocation.longitude,
          }
        );

      if (
        distance >
        schoolSettings.allowedRadius
      ) {
        return res.status(403).json({
          message:
            "You are outside school premises",
        });
      }

      const attendanceDate =
        new Date();

      attendanceDate.setHours(
        0,
        0,
        0,
        0
      );

      const now = new Date();

      let attendanceStatus =
        "PRESENT";

      if (
        now.getHours() > 9 ||
        (now.getHours() === 9 &&
          now.getMinutes() > 15)
      ) {
        attendanceStatus = "LATE";
      }

      const attendance =
        await Attendance.findOneAndUpdate(
          {
            academicRecordId,
            date: attendanceDate,
            session,
          },
          {
            $set: {
              academicRecordId,

              date: attendanceDate,

              session,

              status:
                attendanceStatus,

              punchInLocation: {
                latitude:
                  punchInLocation.latitude,

                longitude:
                  punchInLocation.longitude,

                address:
                  punchInLocation.address ||
                  null,

                accuracy:
                  punchInLocation.accuracy ||
                  null,

                punchedAt:
                  new Date(),
              },

              deviceInfo:
                req.headers[
                "user-agent"
                ] || null,

              ipAddress:
                req.ip || null,
            },
          },
          {
            new: true,
            upsert: true,
          }
        );

      res.status(201).json({
        message:
          "Punch-in successful",

        attendance,
      });
    } catch (error) {
      console.error(
        "PUNCH-IN ERROR:",
        error
      );

      res.status(500).json({
        message: error.message,
      });
    }
  };

/* =====================================================
   PUNCH OUT
===================================================== */
export const punchOut = async (
  req,
  res
) => {
  try {
    const {
      Attendance,
      SchoolSettings,
    } = req.tenantModels;

    const {
      academicRecordId,
      session,
      punchOutLocation,
    } = req.body;

    if (
      !academicRecordId ||
      !session
    ) {
      return res.status(400).json({
        message:
          "academicRecordId and session required",
      });
    }

    if (
      !punchOutLocation ||
      punchOutLocation.latitude ==
      null ||
      punchOutLocation.longitude ==
      null
    ) {
      return res.status(400).json({
        message:
          "Valid punchOutLocation required",
      });
    }

    // GPS accuracy validation
    if (
      punchOutLocation.accuracy &&
      punchOutLocation.accuracy >
      100
    ) {
      return res.status(400).json({
        message:
          "GPS accuracy too low",
      });
    }

    // Fetch school settings
    const schoolSettings =
      await SchoolSettings.findOne({
        singleton: "SETTINGS",
      });

    if (!schoolSettings) {
      return res.status(400).json({
        message:
          "School geo-fence not configured",
      });
    }

    // Validate distance
    const distance =
      getDistance(
        {
          latitude:
            schoolSettings.latitude,

          longitude:
            schoolSettings.longitude,
        },
        {
          latitude:
            punchOutLocation.latitude,

          longitude:
            punchOutLocation.longitude,
        }
      );

    if (
      distance >
      schoolSettings.allowedRadius
    ) {
      return res.status(403).json({
        message:
          "You are outside school premises",
      });
    }

    // Find today's attendance
    const startOfDay =
      new Date();

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay =
      new Date();

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    const attendance =
      await Attendance.findOne({
        academicRecordId,

        session,

        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

    if (!attendance) {
      return res.status(404).json({
        message:
          "Punch-in not found",
      });
    }

    if (
      attendance.punchOutTime
    ) {
      return res.status(400).json({
        message:
          "Already punched out",
      });
    }

    const punchOutTime =
      new Date();

    const workingHours =
      (punchOutTime -
        attendance
          .punchInLocation
          .punchedAt) /
      (1000 * 60 * 60);

    // SAVE PUNCH OUT
    attendance.punchOutTime =
      punchOutTime;

    attendance.workingHours =
      Number(
        workingHours.toFixed(2)
      );

    attendance.punchOutLocation =
    {
      latitude:
        punchOutLocation.latitude,

      longitude:
        punchOutLocation.longitude,

      accuracy:
        punchOutLocation.accuracy ||
        null,

      punchedOutAt:
        punchOutTime,
    };

    await attendance.save();

    res.json({
      message:
        "Punch-out successful",

      attendance,
    });
  } catch (error) {
    console.error(
      "PUNCH-OUT ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};



/* =====================================================
   GET ALL STAFF ATTENDANCE HISTORY
===================================================== */

export const getAllStaffAttendanceHistory = async (
  req,
  res
) => {
  try {

    const { Attendance } =
      req.tenantModels;

    // ONLY STAFF ATTENDANCE
    // Students won't have punchInLocation
    const records =
      await Attendance.find({
        punchInLocation: {
          $exists: true,
        },
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // FORMAT RESPONSE FOR FRONTEND
    const formatted =
      records.map((record) => ({
        _id: record._id,

        academicRecordId:
          record.academicRecordId,

        session: record.session,

        status: record.status,

        date: record.date,

        createdAt:
          record.createdAt,

        updatedAt:
          record.updatedAt,

        workingHours:
          record.workingHours || 0,

        // PUNCH IN
        punchInTime:
          record.punchInLocation
            ?.punchedAt || null,

        // PUNCH OUT
        punchOutTime:
          record.punchOutLocation
            ?.punchedOutAt || null,

        // LOCATION
        punchInLocation:
          record.punchInLocation || null,

        punchOutLocation:
          record.punchOutLocation ||
          null,

        // OPTIONAL
        deviceInfo:
          record.deviceInfo || null,

        ipAddress:
          record.ipAddress || null,
      }));

    console.log(
      "STAFF ATTENDANCE:",
      formatted.length
    );

    res.status(200).json(
      formatted
    );

  } catch (err) {

    console.error(
      "GET STAFF ATTENDANCE ERROR:",
      err
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to fetch staff attendance history",

      error: err.message,
    });
  }
};

/* =====================================================
   MONTHLY REPORT
===================================================== */
export const monthlyReport =
  async (req, res) => {
    try {
      const { Attendance } =
        req.tenantModels;

      const { month, year } =
        req.query;

      const startDate = new Date(
        year,
        month - 1,
        1
      );

      const endDate = new Date(
        year,
        month,
        0
      );

      const report =
        await Attendance.find({
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        });

      res.json(report);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };

/* =====================================================
   ATTENDANCE HISTORY
===================================================== */
export const attendanceHistory =
  async (req, res) => {
    try {
      const { Attendance } =
        req.tenantModels;

      const {
        academicRecordId,
      } = req.params;

      const history =
        await Attendance.find({
          academicRecordId,
        }).sort({
          date: -1,
        });

      res.json(history);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };