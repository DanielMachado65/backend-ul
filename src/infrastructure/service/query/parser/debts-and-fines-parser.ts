import { Debt, DebtRecord, DebtsAndFinesVo } from 'src/domain/value-object/debts-and-fines.vo';
import {
  QueryDebsAndFinesRecords,
  QueryDebts,
  QueryDebtsAndFinesVo,
} from 'src/domain/value-object/query/query-debts-and-fines.vo';

export class DebstAndFinesParser {
  static parse(debtsAndFines: DebtsAndFinesVo): QueryDebtsAndFinesVo {
    if (debtsAndFines === null || debtsAndFines === undefined) return null;

    const debts: ReadonlyArray<QueryDebts> = debtsAndFines?.debts?.map((debt: Debt) => ({
      tipo: debt.type,
      valorTotalEmCentavos: debt.totalValueInCents,
      registros: DebstAndFinesParser._parseDebtsAndFinesRecords(debt.records),
    }));

    return {
      noDebts: !debtsAndFines?.hasDebts,
      invalidState: !debtsAndFines?.validState,
      noVehicle: !debtsAndFines?.hasVehicle,
      protocolo: debtsAndFines?.protocol,
      debitos: debts,
    };
  }

  private static _parseDebtsAndFinesRecords(
    records: ReadonlyArray<DebtRecord>,
  ): ReadonlyArray<QueryDebsAndFinesRecords> {
    return records?.map((record: DebtRecord) => ({
      dataDeCriacao: record?.createdAt ? new Date(record.createdAt) : null,
      dataDeExpiracao: record?.dueDate ? new Date(record.dueDate) : null,
      dependeDe: record?.dependsOn ?? [],
      descricao: record.description,
      distinguirDe: record.distinct ?? [],
      idExterno: record.externalId,
      obrigatorio: record.required,
      protocolo: record.protocol,
      tipo: record.type,
      titulo: record.title,
      valorEmCentavos: record.amountInCents,
    }));
  }
}
