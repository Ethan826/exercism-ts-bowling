import { NextRollsQueryable } from "./frame-holder";

export interface IFrame {
  isComplete: boolean;
  score: number | undefined;
  roll: (roll: number) => IFrame;
  numBallsRolled: number;
  firstRoll: number | undefined;
  secondRoll: number | undefined;
}

abstract class Frame implements IFrame {
  protected readonly MAX_PINS = 10;
  protected readonly MIN_PINS = 0;
  protected readonly NEGATIVE_ROLL_MESSAGE = "Negative roll is invalid";
  protected readonly TOO_MANY_PINS_MESSAGE =
    "Pin count exceeds pins on the lane";
  public readonly isComplete: boolean = false;
  public readonly numBallsRolled: 0 | 1 | 2 | 3 = 0;
  public readonly firstRoll: number | undefined = undefined;
  public readonly secondRoll: number | undefined = undefined;

  public roll(pins: number): IFrame {
    throw new Error("Invalid roll");
  }

  public get score(): number | undefined {
    return;
  }

  protected validateRoll(pins: number) {
    if (pins > this.MAX_PINS) throw new Error(this.TOO_MANY_PINS_MESSAGE);
    if (pins < this.MIN_PINS) throw new Error(this.NEGATIVE_ROLL_MESSAGE);
  }
}

abstract class CompletedFrame extends Frame implements IFrame {
  public readonly isComplete: boolean = true;
}

export class NewFrame extends Frame implements IFrame {
  constructor(protected nextRollsProvider?: NextRollsQueryable) {
    super();
  }

  public roll(pins: number) {
    this.validateRoll(pins);

    if (pins === this.MAX_PINS) {
      return new StrikeFrame(this.nextRollsProvider);
    } else {
      return new SecondRollFrame(pins, this.nextRollsProvider);
    }
  }
}

export class SecondRollFrame extends Frame implements IFrame {
  public readonly numBallsRolled = 1;

  constructor(
    public firstRoll: number,
    private nextRollsProvider?: NextRollsQueryable
  ) {
    super();
  }

  public roll(pins: number) {
    if (pins < 0) throw new Error(this.NEGATIVE_ROLL_MESSAGE);
    if (pins + this.firstRoll > this.MAX_PINS)
      throw new Error(this.TOO_MANY_PINS_MESSAGE);

    if (this.firstRoll + pins === this.MAX_PINS) {
      return new SpareFrame(this.firstRoll, pins, this.nextRollsProvider);
    } else {
      return new OpenFrame(this.firstRoll, pins);
    }
  }
}

export class OpenFrame extends CompletedFrame implements IFrame {
  public readonly numBallsRolled = 2;

  constructor(public firstRoll: number, public secondRoll: number) {
    super();
  }

  get score(): number {
    return this.firstRoll + this.secondRoll;
  }
}

export class SpareFrame extends CompletedFrame implements IFrame {
  public readonly numBallsRolled = 2;

  constructor(
    public firstRoll: number,
    public secondRoll: number,
    private nextRollsProvider?: NextRollsQueryable
  ) {
    super();

    if (firstRoll + secondRoll !== this.MAX_PINS) {
      throw new Error();
    }
  }

  get score() {
    return this.MAX_PINS + (this.nextRollsProvider?.firstNextRoll ?? 0);
  }
}

export class StrikeFrame extends CompletedFrame implements IFrame {
  public readonly numBallsRolled = 1;
  public readonly firstRoll = this.MAX_PINS;

  constructor(private nextRollsProvider?: NextRollsQueryable) {
    super();
  }

  get score() {
    return (
      this.MAX_PINS +
      (this.nextRollsProvider?.firstNextRoll ?? 0) +
      (this.nextRollsProvider?.secondNextRoll ?? 0)
    );
  }
}

export class NewFinalFrame extends Frame implements IFrame {
  public readonly isComplete = false;

  public roll(pins: number) {
    this.validateRoll(pins);

    if (pins === this.MAX_PINS) {
      return new StrikeSecondRollFinalFrame();
    } else {
      return new SecondRollFinalFrame(pins);
    }
  }
}

export class StrikeSecondRollFinalFrame extends Frame implements IFrame {
  public readonly numBallsRolled = 1;
  public firstRoll = this.MAX_PINS;

  public roll(pins: number) {
    this.validateRoll(pins);

    if (pins === this.MAX_PINS) {
      return new DoubleStrikeThirdRollFinalFrame();
    } else {
      return new StrikeNonStrikeThirdRollFinalFrame(pins);
    }
  }
}

export class SecondRollFinalFrame extends Frame implements IFrame {
  public readonly isComplete = false;
  public readonly numBallsRolled = 1;

  constructor(public firstRoll: number) {
    super();
  }

  public roll(pins: number) {
    this.validateRoll(pins);

    if (pins + this.firstRoll === this.MAX_PINS) {
      return new SpareThirdRollFinalFrame(this.firstRoll, pins);
    } else {
      return new OpenFrame(this.firstRoll, pins);
    }
  }
}

export class SpareThirdRollFinalFrame extends Frame implements IFrame {
  public readonly numBallsRolled = 2;

  constructor(public firstRoll: number, public secondRoll: number) {
    super();
  }

  public roll(pins: number) {
    this.validateRoll(pins);

    return new CompleteWithBonusFinalFrame(
      this.firstRoll,
      this.secondRoll,
      pins
    );
  }
}

export class DoubleStrikeThirdRollFinalFrame extends Frame implements IFrame {
  public readonly numBallsRolled = 2;
  public firstRoll = this.MAX_PINS;
  public secondRoll = this.MAX_PINS;

  public roll(pins: number) {
    this.validateRoll(pins);

    return new CompleteWithBonusFinalFrame(
      this.firstRoll,
      this.secondRoll,
      pins
    );
  }
}

export class StrikeNonStrikeThirdRollFinalFrame
  extends Frame
  implements IFrame
{
  public readonly numBallsRolled = 2;
  public firstRoll = this.MAX_PINS;

  constructor(public secondRoll: number) {
    super();
  }

  public roll(pins: number) {
    this.validateRoll(pins);

    if (pins > this.pinsLeftOnLane) {
      throw new Error(this.TOO_MANY_PINS_MESSAGE);
    }

    return new CompleteWithBonusFinalFrame(
      this.firstRoll,
      this.secondRoll,
      pins
    );
  }

  private get pinsLeftOnLane() {
    return this.MAX_PINS - this.secondRoll;
  }
}

export class CompleteWithBonusFinalFrame
  extends CompletedFrame
  implements IFrame
{
  public readonly numBallsRolled = 3;

  constructor(
    public firstRoll: number,
    public secondRoll: number,
    public thirdRoll: number
  ) {
    super();
  }

  public get score() {
    return this.firstRoll + this.secondRoll + this.thirdRoll;
  }
}
