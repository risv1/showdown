import type { Context } from "hono";
import { z } from "zod";

import { getRedis } from "../../cache/client.js";
import { usersRepository } from "../../database/repositories/users.repository.js";
import { comparePassword, hashPassword } from "../../utils/hash.utils.js";
import { generateJwt } from "../../utils/jwt.utils.js";
import { convertShowdownTimestamp, fetchShowdownUserData } from "../../utils/showdown.utils.js";

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

const CACHE_TTL = {
  USER_SESSION: 3600,
  USER_TOURNAMENTS: 86400,
} as const;

export class AuthController {
  async register(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = registerSchema.parse(body);

      const existingUserByEmail = await usersRepository.findByEmail(validatedData.email);
      if (existingUserByEmail) {
        return c.json({ error: "User with this email already exists" }, 400);
      }

      const existingUserByUsername = await usersRepository.findByUsername(validatedData.username);
      if (existingUserByUsername) {
        return c.json({ error: "User with this username already exists" }, 400);
      }

      const showdownData = await fetchShowdownUserData(validatedData.username);
      let showdownJoinDate: Date | undefined;

      if (showdownData && showdownData.registertime) {
        showdownJoinDate = convertShowdownTimestamp(showdownData.registertime);
      }

      const hashedPassword = await hashPassword(validatedData.password);

      const user = await usersRepository.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        showdownJoinDate,
      });

      const token = generateJwt(user.id.toString());

      const userSessionData = {
        id: user.id,
        username: user.username,
        email: user.email,
        showdownJoinDate: user.showdownJoinDate,
        createdAt: user.createdAt,
      };

      const redis = getRedis();
      const userCacheKey = `user:session:${user.id}`;
      await redis.setex(userCacheKey, CACHE_TTL.USER_SESSION, JSON.stringify(userSessionData));

      return c.json(
        {
          message: "User registered successfully",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            showdownJoinDate: user.showdownJoinDate,
            createdAt: user.createdAt,
          },
          token,
        },
        201
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      console.error("Registration error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async login(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = loginSchema.parse(body);

      const user = await usersRepository.findByUsername(validatedData.username);
      if (!user) {
        return c.json({ error: "Invalid credentials" }, 401);
      }

      if (user.deletedAt) {
        return c.json({ error: "Account has been deactivated" }, 401);
      }

      const isPasswordValid = await comparePassword(validatedData.password, user.password);
      if (!isPasswordValid) {
        return c.json({ error: "Invalid credentials" }, 401);
      }

      if (!user.showdownJoinDate) {
        const showdownData = await fetchShowdownUserData(validatedData.username);
        if (showdownData && showdownData.registertime) {
          const showdownJoinDate = convertShowdownTimestamp(showdownData.registertime);
          await usersRepository.updateShowdownJoinDate(user.id, showdownJoinDate);
          user.showdownJoinDate = showdownJoinDate;
        }
      }

      const token = generateJwt(user.id.toString());

      const userSessionData = {
        id: user.id,
        username: user.username,
        email: user.email,
        showdownJoinDate: user.showdownJoinDate,
        createdAt: user.createdAt,
      };

      const userCacheKey = `user:session:${user.id}`;
      const redis = getRedis();
      await redis.setex(userCacheKey, CACHE_TTL.USER_SESSION, JSON.stringify(userSessionData));

      return c.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          showdownJoinDate: user.showdownJoinDate,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      console.error("Login error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async checkSession(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json(
          {
            isAuthenticated: false,
            error: "No valid session found",
          },
          401
        );
      }

      const userCacheKey = `user:session:${userId}`;
      const redis = getRedis();
      const cachedUser = await redis.get(userCacheKey);

      if (cachedUser) {
        const userData = cachedUser;
        return c.json({
          isAuthenticated: true,
          user: userData,
        });
      }

      const user = await usersRepository.findById(Number.parseInt(userId));
      if (!user || user.deletedAt) {
        return c.json(
          {
            isAuthenticated: false,
            error: "User not found or deactivated",
          },
          401
        );
      }

      const userSessionData = {
        id: user.id,
        username: user.username,
        email: user.email,
        showdownJoinDate: user.showdownJoinDate,
        createdAt: user.createdAt,
      };

      await redis.setex(userCacheKey, CACHE_TTL.USER_SESSION, JSON.stringify(userSessionData));

      return c.json({
        isAuthenticated: true,
        user: userSessionData,
      });
    } catch (error) {
      console.error("Session check error:", error);
      return c.json(
        {
          isAuthenticated: false,
          error: "Session validation failed",
        },
        401
      );
    }
  }

  async getProfile(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const user = await usersRepository.findById(Number.parseInt(userId));
      if (!user || user.deletedAt) {
        return c.json({ error: "User not found" }, 404);
      }

      if (!user.showdownJoinDate) {
        const showdownData = await fetchShowdownUserData(user.username);
        if (showdownData && showdownData.registertime) {
          const showdownJoinDate = convertShowdownTimestamp(showdownData.registertime);
          await usersRepository.updateShowdownJoinDate(user.id, showdownJoinDate);
          user.showdownJoinDate = showdownJoinDate;
        }
      }

      return c.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          showdownJoinDate: user.showdownJoinDate,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Profile error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async refreshShowdownData(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const user = await usersRepository.findById(Number.parseInt(userId));
      if (!user || user.deletedAt) {
        return c.json({ error: "User not found" }, 404);
      }

      const showdownData = await fetchShowdownUserData(user.username);
      if (!showdownData) {
        return c.json({ error: "Unable to fetch Showdown data for this username" }, 404);
      }

      let updatedUser = user;
      if (showdownData.registertime) {
        const showdownJoinDate = convertShowdownTimestamp(showdownData.registertime);
        const result = await usersRepository.updateShowdownJoinDate(user.id, showdownJoinDate);
        if (result) {
          updatedUser = result;
        }
      }

      return c.json({
        message: "Showdown data refreshed successfully",
        user: {
          id: updatedUser!.id,
          username: updatedUser!.username,
          email: updatedUser!.email,
          showdownJoinDate: updatedUser!.showdownJoinDate,
          createdAt: updatedUser!.createdAt,
        },
        showdownData: {
          username: showdownData.username,
          userid: showdownData.userid,
        },
      });
    } catch (error) {
      console.error("Refresh Showdown data error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
}

export const authController = new AuthController();
