import { prisma } from "../config/database.ts";
import type { UserCreateInput } from "../../generated/prisma/models.ts";

export async function findById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function findByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}
export async function findByEmailAndFullname(email: string, fullname: string) {
  return await prisma.user.findFirst({
    where: { OR: [{ email }, { fullname }] },
  });
}

export async function createUser(data: UserCreateInput) {
  return await prisma.user.create({
    data,
  });
}
export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id },
  });
}
