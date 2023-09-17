export type LoopContext = {
  time: number;
  dt: number;
  gameplayFrames: number;
};

export class GameLoop {
  private animationId: number | null = null;
  private ctx: LoopContext = {
    time: 0,
    dt: 1,
    gameplayFrames: 0,
  };

  constructor(
    public startFn: () => void,
    public frameFn: (ctx: LoopContext) => void,
    public frameRate: number = 60,
  ) {}

  start() {
    const wrapper = (time: number) => {
      this.animationId = requestAnimationFrame(wrapper);

      if (this.ctx.gameplayFrames > 0) {
        this.ctx.dt = (time - this.ctx.time) * this.frameRate / 1000;
      }

      this.ctx.time = time;
      this.ctx.gameplayFrames++;
      this.frameFn(this.ctx);
    };

    if (this.animationId === null) {
      this.startFn();
      this.animationId = requestAnimationFrame(wrapper);
    }
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.ctx.dt = 1;
      this.ctx.gameplayFrames = 0;
    }
  }
}
