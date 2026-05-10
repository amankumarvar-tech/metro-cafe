import * as dotenv from "dotenv";

dotenv.config();

const requiredEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but was not provided.`);
    }
    return value;
};

const optionalEnv = (name: string, defaultValue: string): string => {
    return process.env[name] || defaultValue;
};

export const config = {
    port: Number(optionalEnv("PORT", "5000")),
    clientUrl: requiredEnv("CLIENT_URL"),
    mongoUri: requiredEnv("MONGODB_URI"),
    jwtSecret: requiredEnv("JWT_SECRET"),
    jwtRefreshSecret: requiredEnv("JWT_REFRESH_SECRET"),
    jwtExpiresIn: requiredEnv("JWT_EXPIRES_IN"),
    jwtRefreshExpiresIn: requiredEnv("JWT_REFRESH_EXPIRES_IN"),
    nodeEnv: optionalEnv("NODE_ENV", "development") as "development" | "production" | "test",
};

if (Number.isNaN(config.port) || config.port <= 0) {
    throw new Error("Environment variable PORT must be a valid positive number.");
}
