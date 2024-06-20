/* eslint-disable sonarjs/cognitive-complexity */

export class SanitizeUtil {
  static makeRedacted(attr: unknown): string {
    const type: string = typeof attr;

    if (type === 'boolean') return '<BOOLEAN>';
    else if (type === 'number') return '<NUMBER>';
    else if (type === 'string') return '<STRING>';
    else if (type === 'bigint') return '<BIGINT>';
    else if (type === 'symbol') return '<SYMBOL>';
    else if (type === 'undefined') return '<UNDEFINED>';
    else if (type === 'function') return '<FUNCTION>';
    else if (type === 'object' && attr === null) return '<NULL>';
    else if (type === 'object' && Array.isArray(attr)) return '<ARRAY>';
    else if (type === 'object' && attr instanceof Date) return '<DATE>';
    else if (type === 'object' && attr instanceof RegExp) return '<REGEX>';
    else if (type === 'object') return '<OBJECT>';

    return '<UNKNOWN>';
  }

  static applyPolicy(attr: unknown, policy: unknown): unknown {
    const isPolicyBool: boolean = typeof policy === 'boolean';
    const isEnableBool: boolean = policy && isPolicyBool;
    if (isEnableBool) return attr;

    const isAttrArr: boolean = Array.isArray(attr);
    const isPolicyArr: boolean = Array.isArray(policy);
    const isEnableArr: boolean = isAttrArr && isPolicyArr;
    if (isEnableArr) {
      const newAttr: ReadonlyArray<unknown> = (attr as ReadonlyArray<unknown>).map((item: unknown) =>
        SanitizeUtil.applyPolicy(item, policy[0]),
      );
      return newAttr.length > 0 ? newAttr : SanitizeUtil.makeRedacted(attr);
    }

    const isAttrObj: boolean = typeof attr === 'object';
    const isPolicyObj: boolean = typeof policy === 'object';
    const isEnableObj: boolean = attr && isAttrObj && policy && isPolicyObj;
    if (isEnableObj) {
      const newAttr: unknown = Object.keys(attr).reduce((acc: Record<string, unknown>, key: string) => {
        if (policy.hasOwnProperty(key)) acc[key] = SanitizeUtil.applyPolicy(attr[key], policy[key]);
        else acc[key] = SanitizeUtil.makeRedacted(attr[key]);
        return acc;
      }, {});

      return Object.keys(newAttr).length > 0 ? newAttr : SanitizeUtil.makeRedacted(attr);
    }

    return SanitizeUtil.makeRedacted(attr);
  }
}
