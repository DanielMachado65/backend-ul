export type QueryAd = {
  readonly placa: string;
  readonly km: string;
  readonly valor: number;
  readonly data: string;
  readonly observacao: string;
  readonly opcionais: ReadonlyArray<QueryAdOptionals>;
  readonly fotosRaw?: ReadonlyArray<string>;
  readonly fotos?: ReadonlyArray<QueryAdPhoto>;
};

export type QueryAdOptionals = {
  readonly descricao: string;
};

export type QueryAdPhoto = {
  readonly url?: string;
};
