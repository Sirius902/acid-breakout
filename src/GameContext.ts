import Paddle from "./Paddle";
import Particle from "./Particle";
import { compileProgram } from "./program";
import fragmentShaderSource from "./shaders/main.frag?raw";
import vertexShaderSource from "./shaders/main.vert?raw";
import Strip from "./Strip";

export default class GameContext {
  program: WebGLProgram;

  aPosition: number;
  aTexCoord: number;
  aColor: number;

  uRainbow: WebGLUniformLocation;
  uUseSampler: WebGLUniformLocation;
  uSampler: WebGLUniformLocation;
  uResolution: WebGLUniformLocation;
  uTime: WebGLUniformLocation;

  gameActive: boolean = true;
  animationId: number | null = null;

  mousePosition: [number, number];

  time: number = 0.0;
  gameplayFrames: number = 0;
  dt: number = 1.0;

  strip: Strip;
  paddle: Paddle;
  particles: Particle[] = [];

  constructor(
    public canvas: HTMLCanvasElement,
    public gl: WebGLRenderingContext,
  ) {
    const program = compileProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) {
      throw new Error("Failed to create program");
    }

    this.program = program;

    gl.useProgram(program);

    const aPosition = gl.getAttribLocation(program, "a_Position");
    if (aPosition < 0) {
      throw new Error("Failed to get the storage location of a_Position");
    }

    this.aPosition = aPosition;

    const aTexCoord = gl.getAttribLocation(program, "a_TexCoord");
    if (aTexCoord < 0) {
      throw new Error("Failed to get the storage location of a_TexCoord");
    }

    this.aTexCoord = aTexCoord;

    const aColor = gl.getAttribLocation(program, "a_Color");
    if (aColor < 0) {
      throw new Error("Failed to get the storage location of a_Color");
    }

    this.aColor = aColor;

    const uRainbow = gl.getUniformLocation(program, "u_Rainbow");
    if (!uRainbow) {
      throw new Error("Failed to get the storage location of u_Rainbow");
    }

    this.uRainbow = uRainbow;

    const uUseSampler = gl.getUniformLocation(program, "u_UseSampler");
    if (!uUseSampler) {
      throw new Error("Failed to get the storage location of u_UseSampler");
    }

    this.uUseSampler = uUseSampler;

    const uSampler = gl.getUniformLocation(program, "u_Sampler");
    if (!uSampler) {
      throw new Error("Failed to get the storage location of u_Sampler");
    }

    this.uSampler = uSampler;

    const uResolution = gl.getUniformLocation(program, "u_Resolution");
    if (!uResolution) {
      throw new Error("Failed to get the storage location of u_Resolution");
    }

    this.uResolution = uResolution;

    const uTime = gl.getUniformLocation(program, "u_Time");
    if (!uTime) {
      throw new Error("Failed to get the storage location of u_Time");
    }

    this.uTime = uTime;

    this.mousePosition = [canvas.width / 2, 0.0];
    this.strip = new Strip(this);
    this.paddle = new Paddle(this);
  }

  reset(): void {
    this.mousePosition = [this.canvas.width / 2, 0.0];
    this.strip = new Strip(this);
    this.paddle = new Paddle(this);
    this.particles = [];
    this.dt = 1.0;
    this.gameplayFrames = 0;
  }
}
