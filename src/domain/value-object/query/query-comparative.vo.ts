export type QueryComparativeVo = {
  readonly veiculoComparativo: ReadonlyArray<QueryVehicleComparativeVo>;
  readonly opinioesDoDono: ReadonlyArray<QueryCompativeOwnerOpinionVo>;
};

export type QueryCompativeOwnerOpinionVo = {
  readonly brakes: string;
  readonly cambium: string;
  readonly city_consumption: string;
  readonly comfort: string;
  readonly cost_benefit: string;
  readonly internal_space: string;
  readonly performance: string;
  readonly road_consumption: string;
  readonly stability: string;
  readonly suspension: string;
  readonly total_score: string;
  readonly trunk: string;
};

export type QueryVehicleComparativeVo = {
  readonly fipeId: string;
  readonly marca: string;
  readonly modelo: string;
  readonly marcaImagem: string;
  readonly ano: string;
  readonly posicaoGeral: string;
  readonly preco: QueryComparativePriceData;
  readonly planoDeRevisao: QueryComparativeRevisionPlanData;
  readonly espesificacoes: ReadonlyArray<QueryComparativeSpecData>; // TODO - correto é especificacoes
  readonly equipamentos: ReadonlyArray<QueryComparativeEquipmentData>;
  readonly partes: ReadonlyArray<QueryComparativePartData>;
  readonly descricao: QueryComparativeDepreciationData; // TODO - correto é depreciacao
};

export type QueryComparativePriceData = {
  readonly preco: string;
  readonly posicao: string;
};

export type QueryComparativeRevisionPlanData = {
  readonly primeiraRevisaoPreco: string;
  readonly posicao: string;
};

export type QueryComparativeSpecData = {
  readonly descricao: string;
  readonly valor: string;
  readonly posicao: string;
};

export type QueryComparativeEquipmentData = {
  readonly descricao: string;
  readonly status: string;
  readonly posicao: string;
};

export type QueryComparativePartData = {
  readonly parte: {
    readonly id: string;
    readonly descricao: string;
  };
  readonly preco: string;
  readonly posicao: string;
};

export type QueryComparativeDepreciationData = {
  readonly seisMesesPorcentagemDeIdade: string;
  readonly posicao: string;
};
