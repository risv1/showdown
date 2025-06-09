import { eq } from "drizzle-orm";

import { db } from "../db";
import { users } from "../schema/users";

export type CreateUserData = {
  username: string;
  email: string;
  password: string;
  showdownJoinDate?: Date;
};

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  showdownJoinDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class UsersRepository {
  async createUser(userData: CreateUserData): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        showdownJoinDate: userData.showdownJoinDate || null,
      })
      .returning();

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    return user || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

    return user || null;
  }

  async findById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    return user || null;
  }

  async updateUser(id: number, updates: Partial<CreateUserData>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user || null;
  }

  async updateShowdownJoinDate(id: number, showdownJoinDate: Date): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        showdownJoinDate,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [user] = await db
      .update(users)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return !!user;
  }
}

export const usersRepository = new UsersRepository();
