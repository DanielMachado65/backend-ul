import { PaginatedReviewsOrdering } from 'src/domain/_layer/presentation/dto/get-paginated-reviews-input.dto';
import { ListReviewsDomain, PaginatedReviews } from 'src/domain/support/owner-review/list-reviews.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(ListReviewsDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<ListReviewsDomain> = TestSetup.run(ListReviewsDomain);

  test('List first page review', async () => {
    /** - Setup - */
    const servicePage: PaginatedReviews = {
      totalPages: 1,
      amountInThisPage: 4,
      currentPage: 1,
      itemsPerPage: 10,
      nextPage: null,
      previousPage: null,
      items: [
        {
          id: '35619dc0-9e07-417a-947e-4d2685e2f2ff',
          averageScore: 8.253846153846153,
          strengths: 'Tecnologia, conforto e custo benefício',
          cons: 'Demora em algumas peças, câmbio cvt com 4 marchas meio "burrinho", mas passa de ano',
          flaws:
            'Defeito na válvula solenoide do câmbio, resolvido pela garantia do veículo, vazamento no radiador, resolvido pela garantia e troca da válvula termostática do liquido de arrefecimento (devido ao uso natural)',
          generalFeedback:
            'Vale a pena pela relação custo x benefício. não é um carro rápidp, mas muito confortável, bonito e no geral agradável',
          km: 61207,
          createdAt: '2023-08-30T23:35:25.890Z',
          owner: {
            name: 'Allan Pinheiro De Azevedo',
          },
          ranking: {
            comfort: 9,
            cambium: 6,
            cityConsumption: 6,
            roadConsumption: 8,
            performance: 8,
            drivability: 9,
            internalSpace: 9,
            stability: 10,
            brakes: 9,
            trunk: 8,
            suspension: 9,
            costBenefit: 8,
            totalScore: 8.3,
          },
          engagement: {
            likes: 0,
            dislikes: 0,
          },
          brand: {
            name: 'CHERY',
          },
          model: {
            name: 'TIGGO',
            code: '201540',
          },
          version: {
            fipeId: '730190',
            year: 2020,
          },
        },
        {
          id: '81f11fef-1272-450b-8cb1-472c322ea274',
          averageScore: 7.084615384615384,
          strengths: '',
          cons: '',
          flaws: '',
          generalFeedback: '',
          km: 29000,
          createdAt: '2023-09-01T04:19:31.999Z',
          owner: {
            name: 'Tiago frança ',
          },
          ranking: {
            comfort: 8,
            cambium: 6,
            cityConsumption: 4,
            roadConsumption: 7,
            performance: 8,
            drivability: 8,
            internalSpace: 7,
            stability: 9,
            brakes: 8,
            trunk: 7,
            suspension: 6,
            costBenefit: 7,
            totalScore: 7.1,
          },
          engagement: {
            likes: 0,
            dislikes: 0,
          },
          brand: {
            name: 'CHERY',
          },
          model: {
            name: 'TIGGO',
            code: '201540',
          },
          version: {
            fipeId: '730190',
            year: 2020,
          },
        },
        {
          id: 'f154deaa-2c7c-45fc-a639-0a7ed0c0171b',
          averageScore: 6.915384615384616,
          strengths: 'Porta mala espaçoso.\naltura do solo bom',
          cons: 'Barulho em vidros dianteiros, barulho continuo na aceleração, muito ponto cego, retrovisor nao dobra ao estacionar. \ndirerção hidraulica ainda.\nporta luva cabe somente o doc do carro',
          flaws: 'Desempenho na cidade beberao faz 6,0 por litro . \noleo vasando.',
          generalFeedback: 'Nao . cao caiu muito apos a venda ser brasileira.\nconcessionarias com pessimos mecanicos',
          km: 22120,
          createdAt: '2022-10-25T13:10:52.876Z',
          owner: {
            name: 'HARETHA',
          },
          ranking: {
            comfort: 6,
            cambium: 10,
            cityConsumption: 2,
            roadConsumption: 6,
            performance: 2,
            drivability: 9,
            internalSpace: 9,
            stability: 9,
            brakes: 9,
            trunk: 10,
            suspension: 7,
            costBenefit: 4,
            totalScore: 6.9,
          },
          engagement: {
            likes: 0,
            dislikes: 0,
          },
          brand: {
            name: 'CHERY',
          },
          model: {
            name: 'TIGGO',
            code: '201540',
          },
          version: {
            fipeId: '730190',
            year: 2020,
          },
        },
        {
          id: 'a4610678-955d-4842-b51b-780c5382a144',
          averageScore: 6.253846153846154,
          strengths: 'Conforto e tecnologia',
          cons: 'Consumo e central multimidia.',
          flaws: 'Nenhum defeito',
          generalFeedback: 'Um ótimo carro, única ressalva fica referente ao consumo que é um pouco elevado.',
          km: 26000,
          createdAt: '2022-01-13T12:53:16.115Z',
          owner: {
            name: 'Bruno Marques Santana',
          },
          ranking: {
            comfort: 8,
            cambium: 8,
            cityConsumption: 0,
            roadConsumption: 3,
            performance: 8,
            drivability: 8,
            internalSpace: 8,
            stability: 8,
            brakes: 8,
            trunk: 8,
            suspension: 8,
            costBenefit: 0,
            totalScore: 6.3,
          },
          engagement: {
            likes: 0,
            dislikes: 0,
          },
          brand: {
            name: 'CHERY',
          },
          model: {
            name: 'TIGGO',
            code: '201540',
          },
          version: {
            fipeId: '730190',
            year: 2020,
          },
        },
      ],
      count: 4,
    };

    jest
      .spyOn(setup.servicesMocks.ownerReviewService, 'listPaginated')
      .mockImplementation(async (): Promise<PaginatedReviews> => {
        return servicePage;
      });

    /** - Run - */
    const page: PaginatedReviews = await setup.useCase
      .listPaginated(
        {
          page: 1,
          perPage: 10,
        },
        {
          brandName: 'CHERY',
          modelName: 'TIGGO 2',
          modelYear: 2022,
          detailedModel: '1.5 AT LOOK',
          ordering: PaginatedReviewsOrdering.HIGH_SCORE,
        },
      )
      .unsafeRun();

    /** - Test - */
    expect(page).toBe(servicePage);
  });
});
