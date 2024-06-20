import { Types } from 'mongoose';
import { ServiceDto } from 'src/domain/_layer/data/dto/service.dto';

export const mockServiceDto = (): ServiceDto => ({
  code: Math.floor(Math.random() * 100),
  createdAt: new Date().toISOString(),
  hasAutoSwitching: false,
  id: new Types.ObjectId().toString(),
  minimumPrice: Math.random(),
  name: `any_name_${Math.random()}`,
  status: true,
  supplier: {
    code: Math.floor(Math.random() * 100),
    name: `any_supplier_name_${Math.random()}`,
  },
  switchingServices: [],
});
