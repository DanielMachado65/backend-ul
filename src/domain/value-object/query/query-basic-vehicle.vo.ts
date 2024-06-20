export type QueryBasicVehicleDataVo = {
  readonly anoFabricacao: number;
  readonly anoModelo: number;
  readonly caixaCambio: string;
  readonly capMaxTracao: string;
  readonly capacidadeCarga: number;
  readonly capacidadePassageiro: number;
  readonly chassi: string;
  readonly cilindradas: number;
  readonly codigoFipe: number;
  readonly combustivel: string;
  readonly descricao: string;
  readonly eixos: number;
  readonly especieVeiculo: string;
  readonly informacoesFipe: ReadonlyArray<QueryBasicVehicleFipeInfoData>;
  readonly informacoesGerais: ReadonlyArray<QueryBasicVehicleGeneralInfo>;
  readonly marca: string;
  readonly nacional: string;
  readonly numCarroceria: string;
  readonly numMotor: string;
  readonly numeroEixosAuxiliar: string;
  readonly numeroEixosTraseiro: string;
  readonly pbt: string;
  readonly placa: string;
  readonly potencia: number;
  readonly tipoVeiculo: string;
};

export type QueryBasicVehicleFipeInfoData = {
  readonly ano: number;
  readonly fipeId: string;
  readonly marca: string;
  readonly modelo: string;
  readonly versao: string;
  readonly combustivel: string;
  readonly valorAtual: string;
  readonly historicoPreco: ReadonlyArray<QueryBasicVehicleFipeHistory>;
};

export type QueryBasicVehicleFipeHistory = {
  readonly mes: number;
  readonly ano: number;
  readonly valor: string;
  readonly predicao: boolean;
};

export type QueryBasicVehicleGeneralInfo = {
  readonly fipeId: string;
  readonly versao: string;
  readonly modelo: string;
  readonly marca: string;
};
