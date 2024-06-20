import { PersonScoreVo } from 'src/domain/value-object/credit/person-score.vo';

export const mockPersonScore = (): PersonScoreVo => ({
  paymentProbability: '100%',
  paymentProbabilityMessage: 'any_payment_probability_message',
  creditRisk: 'any_credit_risk',
  creditRiskMessage: 'any_credit_risk_message',
  paymentCommitmentScore: 100,
  profileScore: 100,
  reasonCode1: {
    code: 'any_code_1',
    message: 'any_reason_message_1',
  },
  reasonCode2: {
    code: 'any_code_2',
    message: 'any_reason_message_2',
  },
  reasonCode3: {
    code: 'any_code_3',
    message: 'any_reason_message_3',
  },
  reasonCode4: {
    code: 'any_code_4',
    message: 'any_reason_message_4',
  },
  score: 999,
});
