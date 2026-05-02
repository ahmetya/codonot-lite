import prisma from '@config/db';

class GenericService {
  async getAll() {
    return prisma.generic.findMany();
  }

  async create(title: string, body: string) {
    return prisma.generic.create({
      data: { title, body },
    });
  }
}

export const genericService = new GenericService();
