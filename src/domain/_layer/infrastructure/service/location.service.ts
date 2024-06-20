import { CityDto } from '../../data/dto/city.dto';
import { StateDto } from '../../data/dto/state.dto';

export abstract class LocationService {
  abstract getStates(): Promise<ReadonlyArray<StateDto>>;

  abstract getCities(state: string): Promise<ReadonlyArray<CityDto>>;
}
