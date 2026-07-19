import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model';
import { AuditLog } from '../models/AuditLog.model';
import { env } from '../config/env';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

export interface JwtPayload {
  userId: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

class AuthService {
  generateTokenPair(userId: string, role: string): TokenPair {
    const accessToken = jwt.sign(
      { userId, role, type: 'access' } satisfies JwtPayload,
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId, role, type: 'refresh' } satisfies JwtPayload,
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  }

  async register(
    input: RegisterInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: IUser; tokens: TokenPair }> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new Error('Email already registered');
    }

    const user = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password: input.password,
      role: input.role || 'volunteer',
      phone: input.phone,
    });

    const tokens = this.generateTokenPair(user._id.toString(), user.role);

    // Store hashed refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'register',
      resource: 'user',
      resourceId: user._id.toString(),
      ipAddress,
      userAgent,
      success: true,
    });

    logger.info('User registered', { userId: user._id, role: user.role });
    return { user, tokens };
  }

  async login(
    input: LoginInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: IUser; tokens: TokenPair }> {
    const user = await User.findOne({ email: input.email.toLowerCase() })
      .select('+password +refreshToken');

    if (!user || !(await user.comparePassword(input.password))) {
      await AuditLog.create({
        action: 'login',
        resource: 'user',
        ipAddress,
        userAgent,
        success: false,
        errorMessage: 'Invalid credentials',
      });
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account has been deactivated. Please contact support.');
    }

    const tokens = this.generateTokenPair(user._id.toString(), user.role);

    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'login',
      resource: 'user',
      resourceId: user._id.toString(),
      ipAddress,
      userAgent,
      success: true,
    });

    logger.info('User logged in', { userId: user._id });
    return { user, tokens };
  }

  async refreshTokens(
    refreshToken: string
  ): Promise<TokenPair> {
    const payload = this.verifyRefreshToken(refreshToken);
    if (payload.type !== 'refresh') throw new Error('Invalid token type');

    const user = await User.findById(payload.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid or expired refresh token');
    }

    const tokens = this.generateTokenPair(user._id.toString(), user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    await AuditLog.create({
      user: new mongoose.Types.ObjectId(userId),
      action: 'logout',
      resource: 'user',
      resourceId: userId,
      success: true,
    });
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error('User not found');

    const isValid = await user.comparePassword(oldPassword);
    if (!isValid) throw new Error('Current password is incorrect');

    user.password = newPassword;
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'password_change',
      resource: 'user',
      resourceId: userId,
      success: true,
    });
  }
}

export const authService = new AuthService();
