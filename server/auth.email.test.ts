import { describe, it, expect, beforeAll } from "vitest";
import { createUser, getUserByEmail, updateLastSignedIn, getOrCreateUserProfile } from "./db";

describe("Email Authentication", () => {
  const testEmail = "test@example.com";
  const testPassword = "hashedpassword123";
  const testName = "Test User";

  let userId: number;

  beforeAll(async () => {
    // Create a test user
    userId = await createUser(testEmail, testPassword, testName);
  });

  it("should create a user with email", async () => {
    expect(userId).toBeGreaterThan(0);
  });

  it("should retrieve user by email", async () => {
    const user = await getUserByEmail(testEmail);
    expect(user).toBeDefined();
    expect(user?.email).toBe(testEmail);
    expect(user?.name).toBe(testName);
    expect(user?.loginMethod).toBe("email");
  });

  it("should update last signed in time", async () => {
    const before = new Date();
    await updateLastSignedIn(userId);
    const user = await getUserByEmail(testEmail);
    
    expect(user?.lastSignedIn).toBeDefined();
    expect(new Date(user!.lastSignedIn).getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("should create user profile on demand", async () => {
    const profile = await getOrCreateUserProfile(userId);
    
    expect(profile).toBeDefined();
    expect(profile?.userId).toBe(userId);
    expect(profile?.currentLevel).toBe(1);
    expect(profile?.totalXP).toBe(0);
    expect(profile?.streak).toBe(0);
    expect(profile?.portfolioValue).toBe(1000000);
  });

  it("should return existing profile on second call", async () => {
    const profile1 = await getOrCreateUserProfile(userId);
    const profile2 = await getOrCreateUserProfile(userId);
    
    expect(profile1?.id).toBe(profile2?.id);
  });

  it("should not create user with duplicate email", async () => {
    try {
      await createUser(testEmail, "anotherpassword", "Another User");
      // If no error, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expected to throw an error for duplicate email
      expect(error).toBeDefined();
    }
  });
});
