import { DebtsAndFinesVo } from 'src/domain/value-object/debts-and-fines.vo';
import { QueryDebtsAndFinesVo } from 'src/domain/value-object/query/query-debts-and-fines.vo';
import { DebstAndFinesParser } from 'src/infrastructure/service/query/parser/debts-and-fines-parser';

const mockDebtsAndFinesVo = (): DebtsAndFinesVo => ({
  debts: [
    {
      totalValueInCents: 110000,
      type: 'any_debt_type',
      records: [
        {
          amountInCents: 9000,
          createdAt: '01/01/2020',
          dependsOn: ['record depends on 1', 'record depends on 2'],
          description: 'record description 1',
          distinct: ['record distict 1', 'record distict 2'],
          dueDate: '01/01/2020',
          externalId: 'record external id',
          protocol: 'record protocol 1',
          required: true,
          title: 'record title 1',
          type: 'record type 1',
        },
      ],
    },
  ],
  hasDebts: true,
  hasVehicle: true,
  validState: true,
  protocol: 'any_protocol',
});

describe(DebstAndFinesParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: QueryDebtsAndFinesVo = DebstAndFinesParser.parse(null);
    expect(result).toBe(null);

    const result2: QueryDebtsAndFinesVo = DebstAndFinesParser.parse(undefined);
    expect(result2).toBe(null);
  });

  test('should parse input to QueryDebtsAndFinesVo', () => {
    const debts: DebtsAndFinesVo = mockDebtsAndFinesVo();

    const result: QueryDebtsAndFinesVo = DebstAndFinesParser.parse(debts);

    expect(result).toStrictEqual({
      noDebts: false,
      invalidState: false,
      noVehicle: false,
      protocolo: 'any_protocol',
      debitos: [
        {
          valorTotalEmCentavos: 110000,
          tipo: 'any_debt_type',
          registros: [
            {
              dataDeCriacao: new Date('01/01/2020'),
              dataDeExpiracao: new Date('01/01/2020'),
              dependeDe: ['record depends on 1', 'record depends on 2'],
              descricao: 'record description 1',
              distinguirDe: ['record distict 1', 'record distict 2'],
              idExterno: 'record external id',
              protocolo: 'record protocol 1',
              obrigatorio: true,
              tipo: 'record type 1',
              titulo: 'record title 1',
              valorEmCentavos: 9000,
            },
          ],
        },
      ],
    });
  });

  test('should parse input to QueryDebtsAndFinesVo with debts records null', () => {
    const debts: DebtsAndFinesVo = {
      ...mockDebtsAndFinesVo(),
      debts: [
        {
          ...mockDebtsAndFinesVo().debts[0],
          records: [
            {
              ...mockDebtsAndFinesVo().debts[0].records[0],
              createdAt: null,
              dependsOn: null,
              dueDate: null,
              distinct: null,
            },
          ],
        },
      ],
    };

    const result: QueryDebtsAndFinesVo = DebstAndFinesParser.parse(debts);

    expect(result).toStrictEqual({
      noDebts: false,
      invalidState: false,
      noVehicle: false,
      protocolo: 'any_protocol',
      debitos: [
        {
          valorTotalEmCentavos: 110000,
          tipo: 'any_debt_type',
          registros: [
            {
              dataDeCriacao: null,
              dataDeExpiracao: null,
              dependeDe: [],
              descricao: 'record description 1',
              distinguirDe: [],
              idExterno: 'record external id',
              protocolo: 'record protocol 1',
              obrigatorio: true,
              tipo: 'record type 1',
              titulo: 'record title 1',
              valorEmCentavos: 9000,
            },
          ],
        },
      ],
    });
  });

  test('should parse input to QueryDebtsAndFinesVo with debts records null', () => {
    const debts: DebtsAndFinesVo = {
      ...mockDebtsAndFinesVo(),
      debts: [{ ...mockDebtsAndFinesVo().debts[0], records: null }],
    };

    const result: QueryDebtsAndFinesVo = DebstAndFinesParser.parse(debts);

    expect(result).toStrictEqual({
      noDebts: false,
      invalidState: false,
      noVehicle: false,
      protocolo: 'any_protocol',
      debitos: [
        {
          valorTotalEmCentavos: 110000,
          tipo: 'any_debt_type',
          registros: undefined,
        },
      ],
    });
  });

  test('should parse input to QueryDebtsAndFinesVo with all fields null', () => {
    const debts: DebtsAndFinesVo = {
      debts: null,
      hasDebts: null,
      hasVehicle: null,
      validState: null,
      protocol: null,
    };

    const result: QueryDebtsAndFinesVo = DebstAndFinesParser.parse(debts);

    expect(result).toStrictEqual({
      noDebts: true,
      invalidState: true,
      noVehicle: true,
      protocolo: null,
      debitos: undefined,
    });
  });
});
