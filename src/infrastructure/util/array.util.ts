import { Injectable } from '@nestjs/common';

@Injectable()
export class ArrayUtil {
  shuffle<Item>(previous: ReadonlyArray<Item>): ReadonlyArray<Item> {
    // eslint-disable-next-line functional/prefer-readonly-type
    const next: Array<Item> = [...previous];
    let currentIndex: number = next.length;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      const currItem: Item = next[currentIndex];
      // eslint-disable-next-line functional/immutable-data
      next[currentIndex] = next[randomIndex];
      // eslint-disable-next-line functional/immutable-data
      next[randomIndex] = currItem;
    }

    return next;
  }
}
