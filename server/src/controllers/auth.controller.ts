import { Request, Response } from "express";
import { SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { cacheGet, cacheSet, cacheDel, CacheKeys } from "../config/redis";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

// GET /api/auth/nonce/:address
export async function getNonce(req: Request, res: Response) {
  const address = String(req.params.address).toLowerCase();

  let user = await prisma.user.findUnique({ where: { address } });
  if (!user) {
    user = await prisma.user.create({ data: { address } });
  } else {
    // Rotate nonce every request
    user = await prisma.user.update({
      where: { address },
      data: { nonce: crypto.randomUUID() },
    });
  }

  // Cache nonce for 5 minutes
  await cacheSet(CacheKeys.nonce(address), user.nonce, 300);

  res.json({ nonce: user.nonce });
}

const verifySchema = z.object({
  message: z.string(),
  signature: z.string(),
});

// POST /api/auth/verify
export async function verifySignature(req: Request, res: Response) {
  const { message, signature } = verifySchema.parse(req.body);

  const siweMessage = new SiweMessage(message);
  const result = await siweMessage.verify({ signature });

  if (!result.success) {
    throw new AppError(401, "Invalid signature");
  }

  const address = siweMessage.address.toLowerCase();
  const cachedNonce = await cacheGet<string>(CacheKeys.nonce(address));

  if (cachedNonce && siweMessage.nonce !== cachedNonce) {
    throw new AppError(401, "Invalid nonce");
  }

  let user = await prisma.user.findUnique({ where: { address } });
  if (!user) {
    user = await prisma.user.create({ data: { address } });
  }

  // Invalidate nonce after use
  await cacheDel(CacheKeys.nonce(address));
  // Rotate stored nonce
  await prisma.user.update({ where: { address }, data: { nonce: crypto.randomUUID() } });

  const token = jwt.sign(
    { id: user.id, address: user.address },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );

  res.json({ token, user: { id: user.id, address: user.address, username: user.username } });
}

// GET /api/auth/me
export async function getMe(req: Request & { user?: { id: string; address: string } }, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, address: true, username: true, createdAt: true },
  });
  res.json({ user });
}
