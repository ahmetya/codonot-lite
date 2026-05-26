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

  async getPokemonByIdExternal(pokeId: string): Promise<any | null> {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokeId}`
      );
      if (!response.ok) {
        console.error(
          `Error fetching Pokemon with ID ${pokeId}:`,
          response.statusText
        );
        return null;
      }

      const data = await response.json();
      const { base_experience, name, id } = data; // destructure if needed
      console.log(`Fetched Pokemon data for ID ${id}:`, {
        base_experience,
        name,
        id,
      }); // log specific fields for debugging

      return prisma.pokemon.create({
        data: { pokeId: id, name },
      });

      // console.log(`Fetched Pokemon data for ID ${id}:`, data); // add this for debugging
      return data;
    } catch (error) {
      //  console.error(`Error fetching Pokemon with ID ${pokeId}:`, error);

      return null;
    }
  }
}

export const pokemonService = new PokemonService();
