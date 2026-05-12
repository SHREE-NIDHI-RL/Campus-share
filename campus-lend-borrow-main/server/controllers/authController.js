import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const ALLOWED_DOMAINS = [".edu", ".ac.in", ".edu.in", "college", "university", "institute"];

const isCollegeEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  return ALLOWED_DOMAINS.some((d) => domain.includes(d));
};

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

export const signup = async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;

    if (!isCollegeEmail(email)) {
      return res.status(400).json({ message: "Only college/institutional email addresses are accepted" });
    }

    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ full_name: name, email, password_hash, department, phone });

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    if (user.is_blocked) return res.status(403).json({ message: "Your account has been blocked" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid email or password" });

    const { password_hash, ...safeUser } = user;
    const token = signToken(safeUser);
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
