import { Injectable } from '@nestjs/common';
import * as xlsx from 'xlsx';

@Injectable()
export class SheetUtil {
  // eslint-disable-next-line functional/prefer-readonly-type
  generateBufferFromDataJson(data: Array<unknown>): Buffer {
    const workSheet: xlsx.WorkSheet = xlsx.utils.json_to_sheet(data);
    const workBook: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workBook, workSheet);
    return xlsx.write(workBook, { type: 'buffer' });
  }
}
