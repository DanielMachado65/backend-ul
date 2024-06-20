import { DeepPartial, ObjectUtil } from '../object.util';

describe(ObjectUtil.name, () => {
  const objectUtil: ObjectUtil = new ObjectUtil();

  test("Modify 'person' object", () => {
    type PersonObjectTest = {
      readonly name: string;
      readonly qualities: ReadonlyArray<'smart' | 'fast' | 'happy'>;
      readonly inventory: {
        readonly backpack: ReadonlyArray<'potion' | 'food'>;
        readonly hand: 'sword' | 'knife' | 'none';
      };
    };

    /** - Setup - */
    const person: PersonObjectTest = {
      name: 'Gilf',
      qualities: ['smart', 'fast'],
      inventory: {
        backpack: ['potion'],
        hand: 'none',
      },
    };
    const updatePerson: DeepPartial<PersonObjectTest> = {
      qualities: ['happy', 'fast'],
      inventory: {
        backpack: ['potion', 'food'],
        hand: 'sword',
      },
    };

    /** - Run - */
    const updatedPerson: PersonObjectTest = objectUtil.deepMerge(person, updatePerson);

    /** - Test - */
    const expectedPerson: PersonObjectTest = {
      name: 'Gilf',
      qualities: ['smart', 'fast', 'happy', 'fast'],
      inventory: {
        backpack: ['potion', 'potion', 'food'],
        hand: 'sword',
      },
    };
    expect(updatedPerson).toStrictEqual(expectedPerson);
  });
});
