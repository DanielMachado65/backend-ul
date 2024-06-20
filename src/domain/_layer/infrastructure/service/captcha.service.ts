export abstract class CaptchaService<CaptchaDto> {
  abstract validate(dto: CaptchaDto): Promise<boolean>;
}
