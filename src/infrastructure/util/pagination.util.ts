import { Injectable } from '@nestjs/common';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';

@Injectable()
export class PaginationUtil {
  static paginationFromListPage<Type>(
    collection: ReadonlyArray<Type>,
    page: number,
    perPage: number,
    countOfAll: number,
  ): PaginationOf<Type> {
    const data: ReadonlyArray<Type> = Array.isArray(collection) ? collection : [];
    const firstPage: number = 1;
    const lastPage: number = Math.ceil(countOfAll / perPage);
    return {
      items: data,
      amountInThisPage: collection.length,
      totalPages: lastPage,
      itemsPerPage: perPage,
      currentPage: page,
      nextPage: page >= lastPage ? null : page + 1,
      previousPage: page <= firstPage ? null : page - 1,
      count: countOfAll,
    };
  }
}
