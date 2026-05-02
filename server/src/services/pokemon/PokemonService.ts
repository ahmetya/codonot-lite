import prisma from '@config/db';

class PokemonService {
  async getAll() {
    return prisma.pokemon.findMany();
  }

  async create(pokeId: number, name: string) {
    return prisma.pokemon.create({
      data: { pokeId, name },
    });
  }
}

export const pokemonService = new PokemonService();
