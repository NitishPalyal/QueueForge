import { prisma } from "../config/config.database.js";
export async function findById(id) {
    return await prisma.user.findUnique({
        where: { id },
    });
}
export async function findByEmail(email) {
    return await prisma.user.findUnique({
        where: { email },
    });
}
export async function findByEmailAndFullname(email, fullname) {
    return await prisma.user.findFirst({
        where: { OR: [{ email }, { fullname }] },
    });
}
export async function createUser(data) {
    return await prisma.user.create({
        data,
    });
}
export async function deleteUser(id) {
    await prisma.user.delete({
        where: { id },
    });
}
//# sourceMappingURL=auth.repository.js.map