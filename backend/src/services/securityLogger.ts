import { Request } from "express";
import { prisma } from "../lib/prisma";
import { SecurityEventType } from "@prisma/client";

/**
 * Security Event Logger Service
 * Logs security-relevant events for auditing and monitoring
 */

export interface SecurityLogData {
  userId?: string;
  eventType: SecurityEventType;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  success?: boolean;
}

/**
 * Get client IP address from request
 */
export const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "unknown";
};

/**
 * Get user agent from request
 */
export const getUserAgent = (req: Request): string => {
  return req.headers["user-agent"] || "unknown";
};

/**
 * Log a security event
 */
export const logSecurityEvent = async (
  data: SecurityLogData
): Promise<void> => {
  try {
    await prisma.securityLog.create({
      data: {
        userId: data.userId,
        eventType: data.eventType,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        details: data.details,
        success: data.success ?? true,
      },
    });
  } catch (error) {
    // Don't let logging errors affect the main flow
    console.error("Failed to log security event:", error);
  }
};

/**
 * Log security event from request context
 */
export const logSecurityEventFromRequest = async (
  req: Request,
  eventType: SecurityEventType,
  userId?: string,
  details?: string,
  success: boolean = true
): Promise<void> => {
  await logSecurityEvent({
    userId,
    eventType,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    details,
    success,
  });
};

/**
 * Get security logs for a user
 */
export const getUserSecurityLogs = async (
  userId: string,
  limit: number = 50
) => {
  return prisma.securityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

/**
 * Get recent failed login attempts for an IP
 */
export const getRecentFailedLogins = async (
  ipAddress: string,
  withinMinutes: number = 15
): Promise<number> => {
  const since = new Date();
  since.setMinutes(since.getMinutes() - withinMinutes);

  const count = await prisma.securityLog.count({
    where: {
      ipAddress,
      eventType: "LOGIN_FAILED",
      createdAt: { gte: since },
    },
  });

  return count;
};

/**
 * Check if IP is suspicious (too many failed attempts)
 */
export const isIpSuspicious = async (
  ipAddress: string,
  threshold: number = 10
): Promise<boolean> => {
  const failedAttempts = await getRecentFailedLogins(ipAddress);
  return failedAttempts >= threshold;
};
