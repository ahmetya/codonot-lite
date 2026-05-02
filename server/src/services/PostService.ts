// src/services/PostService.ts
// import prisma from "../config/db";
import prisma from "@config/db";

class PostService {
  async getAll() {
    return prisma.post.findMany();
  }

  async create(title: string, body: string) {
    return prisma.post.create({
      data: { title, body },
    });
  }
}

export const postService = new PostService();
