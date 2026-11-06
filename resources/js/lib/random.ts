/**
 * Menggunakan crypto.getRandomValues() untuk menjamin keacakan yang adil dan aman
 */

export function secureRandom(): number {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  return Math.random();
}

export function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (range <= 0) return min;

  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint32Array(1);
    const maxUint = 0xffffffff;
    const bucketSize = Math.floor(maxUint / range);
    const limit = bucketSize * range;

    let randomVal: number;
    do {
      window.crypto.getRandomValues(array);
      randomVal = array[0];
    } while (randomVal >= limit);

    return min + Math.floor(randomVal / bucketSize);
  }

  return Math.floor(Math.random() * range) + min;
}

/**
 * Fisher-Yates shuffle menggunakan crypto.getRandomValues
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickRandom<T>(array: T[]): { item: T; index: number } | null {
  if (array.length === 0) return null;
  const index = secureRandomInt(0, array.length - 1);
  return { item: array[index], index };
}

export function pickMultipleRandom<T>(array: T[], count: number): T[] {
  if (array.length === 0 || count <= 0) return [];
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}
