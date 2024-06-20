import { Injectable } from '@nestjs/common';
import { RevisionConfig } from 'src/domain/_entity/my-car-product.entity';
import {
  RevisionPlanDto,
  RevisionPlanItemDto,
  RevisionPlanNotifyDto,
} from 'src/domain/_layer/data/dto/revision-plan.dto';

@Injectable()
export class RevisionPlanUtils {
  public static readonly RevisionIntervalKm: number = 10_000;

  public execute(revisionConfig: RevisionConfig, revisionPlan: RevisionPlanDto): RevisionPlanNotifyDto {
    const estimatedKilometersRevision: number =
      revisionPlan.revisions.length === 0
        ? this._findClosestRevisionDefaultMileage(revisionConfig.mileageKm)
        : this._findClosestRevision(revisionConfig.mileageKm, revisionPlan);

    const estimatedRevisionDate: Date = this._getEstimatedRevisionDate(
      estimatedKilometersRevision,
      revisionConfig.mileageKm,
      revisionConfig.mileageKmMonthly,
    );

    const estimatedFullPrice: number = this._getEstimatedFullPrice(estimatedKilometersRevision, revisionPlan);

    return {
      estimatedKilometersRevision,
      estimatedRevisionDate,
      estimatedFullPrice,
    };
  }

  public isToday(estimatedRevisionDate: Date): boolean {
    estimatedRevisionDate.setHours(0, 0, 0, 0); // remove hours, minutes, seconds and milliseconds

    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);

    return today.getTime() === estimatedRevisionDate.getTime();
  }

  public isDaysBeforeRevision(
    estimatedKilometersRevision: number,
    daysBefore: number,
    currentMileage: number,
    monthlyMileage: number,
  ): boolean {
    const daysUntilRevision: number = this._calculateDaysUntilRevision(
      estimatedKilometersRevision,
      currentMileage,
      monthlyMileage,
    );
    return daysUntilRevision === daysBefore;
  }

  /*
   * 7 days before revision
   */
  public is7DaysBeforeRevision(
    estimatedKilometersRevision: number,
    currentMileage: number,
    monthlyMileage: number,
  ): boolean {
    return this.isDaysBeforeRevision(estimatedKilometersRevision, 7, currentMileage, monthlyMileage);
  }

  /*
   * 15 days before revision
   */
  public is15DaysBeforeRevision(
    estimatedKilometersRevision: number,
    currentMileage: number,
    monthlyMileage: number,
  ): boolean {
    return this.isDaysBeforeRevision(estimatedKilometersRevision, 15, currentMileage, monthlyMileage);
  }

  /*
   * 30 days before revision
   */
  public is30DaysBeforeRevision(
    estimatedKilometersRevision: number,
    currentMileage: number,
    monthlyMileage: number,
  ): boolean {
    return this.isDaysBeforeRevision(estimatedKilometersRevision, 30, currentMileage, monthlyMileage);
  }

  private _getEstimatedRevisionDate(
    estimatedKilometersRevision: number,
    currentMileage: number,
    monthlyMileage: number,
  ): Date {
    const daysUntilRevision: number = this._calculateDaysUntilRevision(
      estimatedKilometersRevision,
      currentMileage,
      monthlyMileage,
    );

    const estimatedRevisionDate: Date = new Date();
    estimatedRevisionDate.setDate(estimatedRevisionDate.getDate() + daysUntilRevision);

    return estimatedRevisionDate;
  }

  private _getEstimatedFullPrice(estimatedRevision: number, revisions: RevisionPlanDto): number | null {
    if (revisions.revisions.length === 0) return null;

    return revisions.revisions.find((revision: RevisionPlanItemDto) => revision.kilometers === estimatedRevision)
      .fullPrice;
  }

  private _findClosestRevisionDefaultMileage(currentKilometers: number): number {
    const revisionIntervalKm: number = RevisionPlanUtils.RevisionIntervalKm;
    const intervalsPassed: number = Math.floor(currentKilometers / revisionIntervalKm);
    const lastRevisionKm: number = intervalsPassed * revisionIntervalKm;
    const nextRevisionKm: number = (intervalsPassed + 1) * revisionIntervalKm;
    const isCloserToNextRevision: boolean = currentKilometers - lastRevisionKm > nextRevisionKm - currentKilometers;

    return isCloserToNextRevision ? nextRevisionKm : lastRevisionKm;
  }

  private _findClosestRevision(km: number, { revisions }: RevisionPlanDto): number {
    let closestKm: number = revisions[0].kilometers;
    let smallestDifference: number = Math.abs(km - closestKm);

    revisions.forEach((revision: RevisionPlanItemDto) => {
      const currentDifference: number = Math.abs(km - revision.kilometers);
      if (currentDifference < smallestDifference) {
        smallestDifference = currentDifference;
        closestKm = revision.kilometers;
      }
    });

    return closestKm;
  }

  private _calculateDaysUntilRevision(
    estimatedKilometersRevision: number,
    currentMileage: number,
    monthlyMileage: number,
  ): number {
    const dailyMileage: number = monthlyMileage / 30;
    return Math.ceil((estimatedKilometersRevision - currentMileage) / dailyMileage);
  }
}
