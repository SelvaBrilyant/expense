import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // Check if user has any active (non-revoked) session
      // This enables real-time logout when sessions are revoked
      const hasActiveSession = await prisma.refreshToken.findFirst({
        where: {
          userId: decoded.id,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!hasActiveSession) {
        res.status(401);
        throw new Error("Session revoked, please login again");
      }

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          currency: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};
