/* =====================================================
   MARK ATTENDANCE (Single Student - Session Wise)
   Now supports optional punchInLocation field
===================================================== */

export const markAttendance = async (req, res) => {
  try {
    const { academicRecordId, date, session, status, punchInLocation } = req.body;
    const { Attendance } = req.tenantModels;

    if (!academicRecordId || !date || !session || !status) {
      return res.status(400).json({
        message: "academicRecordId, date, session and status are required"
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Build the update payload
    const updatePayload = {
      academicRecordId,
      date: attendanceDate,
      session,
      status
    };

    // ✅ Attach location if provided
    if (punchInLocation && punchInLocation.latitude && punchInLocation.longitude) {
      updatePayload.punchInLocation = {
        latitude: punchInLocation.latitude,
        longitude: punchInLocation.longitude,
        address: punchInLocation.address || null,
        accuracy: punchInLocation.accuracy || null,
        punchedAt: punchInLocation.punchedAt ? new Date(punchInLocation.punchedAt) : new Date()
      };
    }

    const attendance = await Attendance.findOneAndUpdate(
      {
        academicRecordId,
        date: attendanceDate,
        session
      },
      updatePayload,
      {
        new: true,
        upsert: true
      }
    );

    res.status(201).json(attendance);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   BULK MARK ATTENDANCE
   Each record can optionally carry punchInLocation
===================================================== */
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { records, date, session, punchInLocation } = req.body;
    const { Attendance } = req.tenantModels;

    if (!records || !date || !session) {
      return res.status(400).json({ message: "records, date and session required" });
    }

    // Normalize date to UTC Midnight
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // ✅ Build location payload once (shared for whole bulk action)
    let locationPayload = {};
    if (punchInLocation && punchInLocation.latitude && punchInLocation.longitude) {
      locationPayload = {
        "punchInLocation.latitude": punchInLocation.latitude,
        "punchInLocation.longitude": punchInLocation.longitude,
        "punchInLocation.address": punchInLocation.address || null,
        "punchInLocation.accuracy": punchInLocation.accuracy || null,
        "punchInLocation.punchedAt": punchInLocation.punchedAt
          ? new Date(punchInLocation.punchedAt)
          : new Date()
      };
    }

    const bulkOps = records.map(r => ({
      updateOne: {
        filter: {
          academicRecordId: r.academicRecordId,
          date: attendanceDate,
          session: session
        },
        update: {
          $set: {
            status: r.status,
            academicRecordId: r.academicRecordId,
            date: attendanceDate,
            session: session,
            // ✅ Attach location to every record in the bulk op
            ...locationPayload
          }
        },
        upsert: true
      }
    }));

    const result = await Attendance.bulkWrite(bulkOps);
    res.json({ message: "Attendance saved successfully", result });

  } catch (error) {
    console.error("BULK SAVE ERROR:", error);

    if (error.code === 11000) {
      return res.status(500).json({
        error: "Database Index Error: Ensure your Attendance model allows multiple sessions per day."
      });
    }

    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   GET STUDENT REPORT (with location data)
   Route: GET /attendance/student-report
===================================================== */
export const getStudentAttendance = async (req, res) => {
  try {
    const { academicRecordId, startDate, endDate } = req.query;
    const { Attendance } = req.tenantModels;

    if (!academicRecordId) {
      return res.status(400).json({ message: "academicRecordId is required" });
    }

    let query = { academicRecordId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setUTCHours(0, 0, 0, 0);
        query.date.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setUTCHours(23, 59, 59, 999);
        query.date.$lte = e;
      }
    }

    const records = await Attendance.find(query).sort({ date: -1, session: 1 });

    // ✅ punchInLocation is automatically included in find() response
    res.json(records);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   GET CLASS ATTENDANCE (with location)
   GET /api/attendance/class
===================================================== */
export const getClassAttendance = async (req, res) => {
  try {
    const { date, session } = req.query;
    const { Attendance } = req.tenantModels;

    if (!date || !session) {
      return res.status(400).json({ message: "date and session required" });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const records = await Attendance.find({
      date: attendanceDate,
      session
    });

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET MONTHLY ATTENDANCE SUMMARY
===================================================== */
export const getMonthlyAttendanceSummary = async (req, res) => {
  try {
    const { academicRecordId, month, year } = req.query;
    const { Attendance } = req.tenantModels;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await Attendance.find({
      academicRecordId,
      date: { $gte: startDate, $lte: endDate }
    });

    const total = records.length;
    const present = records.filter(r => r.status === "PRESENT").length;
    const percentage = total === 0 ? 0 : ((present / total) * 100).toFixed(2);

    res.json({
      totalDays: total,
      presentDays: present,
      percentage
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   ✅ NEW: STAFF PUNCH-IN
   Route: POST /api/attendance/punch-in
   Body: { staffId, session, punchInLocation }
   
   Use this when a STAFF MEMBER punches in themselves
   (not bulk student attendance).
===================================================== */
export const staffPunchIn = async (req, res) => {
  try {
    const { academicRecordId, session, punchInLocation } = req.body;
    const { Attendance } = req.tenantModels;

    if (!academicRecordId || !session) {
      return res.status(400).json({
        message: "academicRecordId and session are required"
      });
    }

    if (!punchInLocation || !punchInLocation.latitude || !punchInLocation.longitude) {
      return res.status(400).json({
        message: "punchInLocation with latitude and longitude is required for punch-in"
      });
    }

    const now = new Date();
    const attendanceDate = new Date(now);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      {
        academicRecordId,
        date: attendanceDate,
        session
      },
      {
        $set: {
          academicRecordId,
          date: attendanceDate,
          session,
          status: "PRESENT",
          punchInLocation: {
            latitude: punchInLocation.latitude,
            longitude: punchInLocation.longitude,
            address: punchInLocation.address || null,
            accuracy: punchInLocation.accuracy || null,
            punchedAt: new Date()
          }
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    res.status(201).json({
      message: "Punch-in recorded successfully",
      attendance
    });

  } catch (error) {
    console.error("PUNCH-IN ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};