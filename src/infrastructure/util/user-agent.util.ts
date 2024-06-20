import { Injectable } from '@nestjs/common';

@Injectable()
export class UserAgentUtil {
  isMobile(userAgent: string): boolean {
    const toMatch: readonly RegExp[] = [/Android/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];

    return toMatch.some((toMatchItem: RegExp) => {
      return userAgent.match(toMatchItem);
    });
  }
}
