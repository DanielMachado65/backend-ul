import { ModelDefinition, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MQueryComposer } from './query-composer.model';

export type MQueryRulesDocument = MQueryRules & mongoose.Document;

export class MQueryRulesRulesRequiredKeysAddress {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  numeroDe: string;
  numeroAte: string;
  complemento: string;
}

export class MQueryRulesRulesRequiredKeys {
  cpf: boolean;
  cnpj: boolean;
  placa: boolean;
  chassi: boolean;
  renavam: boolean;
  motor: boolean;
  uf: boolean;
  email: boolean;
  telefone: boolean;
  dataNascimento: boolean;
  sexo: boolean;
  endereco: MQueryRulesRulesRequiredKeysAddress;
}

export class MQueryRulesRules {
  requiredKeys: MQueryRulesRulesRequiredKeys;
}

@Schema()
export class MQueryRules {
  createAt: Date;
  queryComposition: MQueryComposer;
  rules: MQueryRulesRules;
}

export const mQueryRulesSchema: mongoose.Schema<MQueryRulesDocument> = SchemaFactory.createForClass(MQueryRules);

export const mQueryRulesModelDef: ModelDefinition = { name: MQueryRules.name, schema: mQueryRulesSchema };
