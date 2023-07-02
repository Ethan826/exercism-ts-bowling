import { NewFinalFrame, NewFrame } from "./frame";
import { IFrameHolder, FrameHolder } from "./frame-holder";

export class Bowling {
  private currentFrameIndex = 0;
  private frames: [
    IFrameHolder,
    IFrameHolder,
    IFrameHolder,
    IFrameHolder,
    IFrameHolder,
    IFrameHolder,
    IFrameHolder,
    IFrameHolder,
    IFrameHolder,
    IFrameHolder
  ];

  constructor() {
    const tenth = new FrameHolder(NewFinalFrame);
    const ninth = new FrameHolder(NewFrame, tenth);
    const eighth = new FrameHolder(NewFrame, ninth);
    const seventh = new FrameHolder(NewFrame, eighth);
    const sixth = new FrameHolder(NewFrame, seventh);
    const fifth = new FrameHolder(NewFrame, sixth);
    const fourth = new FrameHolder(NewFrame, fifth);
    const third = new FrameHolder(NewFrame, fourth);
    const second = new FrameHolder(NewFrame, third);
    const first = new FrameHolder(NewFrame, second);

    this.frames = [
      first,
      second,
      third,
      fourth,
      fifth,
      sixth,
      seventh,
      eighth,
      ninth,
      tenth,
    ];
  }

  public roll(pins: number): void {
    if (this.currentFrameIndex >= this.frames.length) {
      throw new Error("Cannot roll after game is over");
    }

    this.currentFrame().roll(pins);

    if (this.currentFrame().isComplete) {
      this.currentFrameIndex += 1;
    }
  }

  private currentFrame(): IFrameHolder {
    return this.frames[this.currentFrameIndex];
  }

  public score(): number {
    let result = 0;

    this.frames.forEach((f) => {
      if (!f.isComplete) {
        throw new Error("Score cannot be taken until the end of the game");
      }

      result += f.score ?? 0;
    });

    return result;
  }
}
