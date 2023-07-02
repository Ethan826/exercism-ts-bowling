import { IFrame, NewFrame } from "./frame";

export interface NextRollsQueryable {
  firstNextRoll: number | undefined;
  secondNextRoll: number | undefined;
}

export interface IFrameHolder extends NextRollsQueryable {
  isComplete: boolean;

  firstRoll: number | undefined;
  secondRoll: number | undefined;

  roll: (roll: number) => void;
  score: number | void;
}

export class FrameHolder implements IFrameHolder {
  private frame: IFrame;

  constructor(
    frameCtor: new (nextRollsProvider: NextRollsQueryable) => IFrame = NewFrame,
    private nextFrameHolder?: IFrameHolder
  ) {
    this.frame = new frameCtor(this);
  }

  get firstRoll() {
    return this.frame.firstRoll;
  }

  get secondRoll() {
    return this.frame.secondRoll;
  }

  public roll(pins: number) {
    this.frame = this.frame.roll(pins);
  }

  get firstNextRoll() {
    if (!this.frame.isComplete || !this.nextFrameHolder?.isComplete) {
      return;
    }

    return this.nextFrameHolder?.firstRoll;
  }

  get secondNextRoll() {
    if (!this.frame.isComplete || !this.nextFrameHolder?.isComplete) {
      return;
    }

    return (
      this.nextFrameHolder?.secondRoll ?? this.nextFrameHolder.firstNextRoll
    );
  }

  get isComplete() {
    return this.frame.isComplete;
  }

  get score() {
    return this.frame.score;
  }
}
