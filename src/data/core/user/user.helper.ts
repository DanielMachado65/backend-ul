import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { Result, passwordStrength } from 'check-password-strength';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserAddress } from 'src/domain/_entity/user.entity';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserDataImportance, UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { UserProfile } from 'src/domain/core/user/get-user-profile.domain';
import { GetUserIO } from 'src/domain/core/user/get-user.domain';
import { DateTimeManipulateType } from 'src/infrastructure/util/date-time-util.service';
import { StringUtil } from 'src/infrastructure/util/string.util';

@Injectable()
export class UserHelper {
  constructor(private readonly _userRepository: UserRepository) {}

  getUser(userId: string): GetUserIO {
    return EitherIO.of(UnknownDomainError.toFn(), userId)
      .map((id: string) => this._userRepository.getById(id))
      .filter(NoUserFoundDomainError.toFn(), (maybeUser: UserDto | null) => !!maybeUser);
  }

  userToUserProfile(userDto: UserDto): UserProfile {
    return {
      id: userDto.id,
      email: userDto.email,
      cpf: userDto.cpf,
      name: userDto.name,
      phoneNumber: userDto.phoneNumber,
      type: userDto.type,
      lastLogin: userDto.lastLogin,
      createdAt: userDto.createdAt,
      status: userDto.status,
      creationOrigin: userDto.creationOrigin,
      address: userDto.address,
      billingId: userDto.billingId,
      needsPasswordUpdate: userDto.needsPasswordUpdate,
    };
  }

  mapUserDataImportanceToRelativeTimeToDelete(
    dataImportance: UserDataImportance,
  ): readonly [number, DateTimeManipulateType] | null {
    switch (dataImportance) {
      case UserDataImportance.HAS_IMPORTANT: {
        return [5, 'years'];
      }

      case UserDataImportance.HASNT_IMPORTANT: {
        return [3, 'days'];
      }

      case UserDataImportance.UNKNOWN:
        return null;
    }
  }

  static validatePasswordStrength(password: string): boolean {
    const { id }: Result<string> = passwordStrength(password);
    return id >= 2;
  }

  static validateAndFixName(name: string): string {
    const hasNameLastnameCompletion: boolean = / SEMSOBRENOME$/.test(name);

    let treatedName: string = name;
    treatedName = hasNameLastnameCompletion ? treatedName.replace(/ SEMSOBRENOME$/, '') : treatedName;

    treatedName = UserHelper.removePunctuationFromName(treatedName);
    treatedName = treatedName.trim();
    treatedName = StringUtil.removeDuplicateSpaces(treatedName);
    treatedName = treatedName.toLowerCase();
    treatedName = StringUtil.capitalizeEachWord(treatedName);

    treatedName = hasNameLastnameCompletion ? `${treatedName} SEMSOBRENOME` : treatedName;

    if (/ /.test(treatedName)) {
      return treatedName;
    } else {
      return `${treatedName} SEMSOBRENOME`;
    }
  }

  private static _punctuationToDelete: RegExp = /[\d=\/\\*+\-?!,"']/g;
  static removePunctuationFromName(str: string): string {
    return str.replace(UserHelper._punctuationToDelete, '');
  }

  static removeDiacriticAndSpecialCharactersFromAddress(address: UserAddress): UserAddress {
    return {
      zipCode: address.zipCode,
      city: UserHelper._removeDuplicateSpaces(address.city),
      state: address.state,
      neighborhood: UserHelper._removeDiacriticAndSpecialCharacters(address.neighborhood),
      street: UserHelper._removeDiacriticAndSpecialCharacters(address.street),
      complement: UserHelper._removeDiacriticAndSpecialCharacters(address.complement),
      number: address.number,
    };
  }

  static truncateAddress(address: UserAddress): UserAddress {
    return {
      zipCode: UserHelper._limitString(address.zipCode, 0, 8),
      city: UserHelper._limitString(address.city, 0, 50),
      state: UserHelper._limitString(address.state, 0, 2),
      neighborhood: UserHelper._limitString(address.neighborhood, 0, 30),
      street: UserHelper._limitString(address.street, 0, 30),
      complement: UserHelper._limitString(address.complement, 0, 30),
      number: UserHelper._limitString(address.number, 0, 30),
    };
  }

  private static _limitString(str: string, min: number, max: number): string {
    return typeof str === 'string' ? str.substring(min, max) : str;
  }

  private static _removeDuplicateSpaces(str: string): string {
    if (str) {
      let newStr: string = str;
      newStr = StringUtil.removeDuplicateSpaces(newStr);
      newStr = newStr.trim();
      return newStr;
    } else {
      return str;
    }
  }

  private static _removeDiacriticAndSpecialCharacters(str: string): string {
    if (str) {
      let newStr: string = str;
      newStr = StringUtil.removeDiacritic(newStr);
      newStr = StringUtil.removeSpecialCharacters(newStr);
      newStr = StringUtil.removeDuplicateSpaces(newStr);
      newStr = newStr.trim();
      return newStr;
    } else {
      return str;
    }
  }
}
