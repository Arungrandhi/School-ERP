/* =====================================================
   MARK ATTENDANCE (Single Student - Session Wise)
===================================================== */

export const markAttendance = async (req, res) => {
  try {
    const { academicRecordId, date, session, status } = req.body;
    const { Attendance } = req.tenantModels;

    if (!academicRecordId || !date || !session || !status) {
      return res.status(400).json({
        message: "academicRecordId, date, session and status are required"
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      {
        academicRecordId,
        date: attendanceDate,
        session
      },
      {
        academicRecordId,
        date: attendanceDate,
        session,
        status
      },
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
   BULK MARK ATTENDANCE (Fixed Date Normalization)
===================================================== */
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { records, date, session } = req.body;
    const { Attendance } = req.tenantModels;

    if (!records || !date || !session) {
      return res.status(400).json({ message: "records, date and session required" });
    }

    // Normalize date to UTC Midnight
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const bulkOps = records.map(r => ({
      updateOne: {
        filter: {
          academicRecordId: r.academicRecordId,
          date: attendanceDate,
          session: session // We filter by session so Morning doesn't conflict with Afternoon
        },
        update: {
          $set: {
            status: r.status,
            // These ensure the fields are created if it's a new record (upsert)
            academicRecordId: r.academicRecordId,
            date: attendanceDate,
            session: session
          }
        },
        upsert: true
      }
    }));

    const result = await Attendance.bulkWrite(bulkOps);
    res.json({ message: "Attendance saved successfully", result });

  } catch (error) {
    console.error("BULK SAVE ERROR:", error); // This will show the real error in your terminal
    
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      return res.status(500).json({ 
        error: "Database Index Error: Ensure your Attendance model allows multiple sessions per day." 
      });
    }

    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   GET STUDENT REPORT (Fixed for History Modal)
   Route: GET /attendance/student-report
===================================================== */
export const getStudentAttendance = async (req, res) => {
  try {
    // Note: Frontend sends these as Query Params (?academicRecordId=...)
    const { academicRecordId, startDate, endDate } = req.query;
    const { Attendance } = req.tenantModels;

    if (!academicRecordId) {
      return res.status(400).json({ message: "academicRecordId is required" });
    }

    // Build the query object
    let query = { academicRecordId };

    // Add Date Range if provided by the "Filter" button in frontend
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

    console.log("Searching with Query:", query); // Debugging

    const records = await Attendance.find(query)
      .sort({ date: -1, session: 1 }); // -1 shows newest first in history modal

    res.json(records);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   GET CLASS ATTENDANCE (Fixed for Main Page Load)
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