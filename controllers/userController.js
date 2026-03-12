import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  try {
    const { User } = req.tenantModels;
    if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });

    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hashedPassword, role });

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};