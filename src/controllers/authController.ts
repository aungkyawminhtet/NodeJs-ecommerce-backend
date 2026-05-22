const UserDB = require("../models/user");
const crypto = require("crypto");
const { Resend } = require("resend");
// const nodemailer = require("nodemailer");
const { fMs, encode, generateTokens, verifyRefreshToken, setCache, getCache, deleteCache } = require("../utils/helper");
import type e = require("express");

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

// Helper to send emails
const sendEmail = async (to: string, subject: string, html: string) => {
  console.log("This is Send Email function using Resend");
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log("Email Send Successful");
    return data;
  } catch (err) {
    console.error("Resend send email error:", err);
    throw new Error("Resend email transport failed");
  }
};

// const sendEmail = async (to: string, subject: string, html: string) => {  
//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       // host: process.env.SMTP_HOST || "smtp.mailtrap.io",
//       host: 'smtp.gmail.com',
//       secure: true,
//       port: 465,
//       family: 4,
//       auth: {
//         user: process.env.EMAIL || "",
//         pass: process.env.PASSWORD || "",
//       },
//     });

//     await transporter.verify()
//     console.log("SMTP connected");

//     const mailOptions = {
//       from: process.env.EMAIL,
//       to,
//       subject,
//       html,
//     };
//     return await transporter.sendMail(mailOptions);

//   } catch (err) {
//     console.error("Nodemailer send email error:", err);
//     throw new Error("SMTP email transport failed");
//   }
// };

const refreshToken = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const rToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rToken) {
      return next(new Error("Refresh token not provided"));
    }

    const decoded = verifyRefreshToken(rToken);
    if (!decoded) {
      return next(new Error("Invalid or expired refresh token"));
    }

    const cachedToken = await getCache(`refreshToken:${decoded._id}`);
    if (cachedToken !== rToken) {
      return next(new Error("Session expired or token rotated"));
    }

    const user = await UserDB.findById(decoded._id)
      .populate("roles permits", "-__v")
      .select("-__v -password");

    if (!user) {
      return next(new Error("User not found"));
    }

    const tokens = generateTokens(user.toObject());

    await setCache(`refreshToken:${user._id.toString()}`, tokens.refreshToken);

    await setCache(user._id.toString(), {
      ...user.toObject(),
      token: tokens.accessToken,
    });

    // Set HTTP-Only Cookie for Refresh Token
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
    });

    fMs(res, "Token rotated successfully", {
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req: any, res: e.Response, next: e.NextFunction) => {
  try {
    const rToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (rToken) {
      const decoded = verifyRefreshToken(rToken);
      if (decoded) {
        await deleteCache(`refreshToken:${decoded._id.toString()}`);
        await deleteCache(decoded._id.toString());
      }
    }

    // Clear HTTP-Only Cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    fMs(res, "Logged out successfully", null);
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new Error("Email address is required"));
    }

    const user = await UserDB.findOne({ email });
    if (!user) {
      return next(new Error("User with this email does not exist"));
    }

    // Generate reset token and set expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset link
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000/api/v1/auth"}/reset-password?token=${resetToken}`;
    const emailHtml = `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
      <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#007BFF;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(user.email, "Reset Your Password", emailHtml);
    
    fMs(res, "Password reset link sent to your email", null);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return next(new Error("Token and new password are required"));
    }

    const user = await UserDB.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new Error("Reset token is invalid or has expired"));
    }

    // Hash and update the password
    user.password = encode(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    fMs(res, "Password reset successfully", null);
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req: e.Request, res: e.Response, next: e.NextFunction) => {
  try {
    const token = req.query.token || req.body.token;
    console.log("This is Verification Token", token);
    if (!token) {
      return next(new Error("Verification token is required"));
    }

    const user = await UserDB.findOne({ emailVerificationToken: token });
    if (!user) {
      return next(new Error("Invalid or expired verification token"));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    fMs(res, "Email verified successfully", null);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendEmail,
};
