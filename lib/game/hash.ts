import {createHmac} from "crypto";

export function computeGameHash(coins: number, seed: number): string {
  return createHmac("sha256", process.env.GAME_HASH_SECRET!)
    .update(`${seed}${coins}`)
    .digest("hex");
}
