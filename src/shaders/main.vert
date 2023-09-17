attribute vec4 a_Position;
attribute vec2 a_TexCoord;
attribute vec4 a_Color;

varying vec4 v_Color;
varying vec2 v_TexCoord;

void main() {
    gl_Position = a_Position;
    gl_PointSize = 1.0;
    v_Color = a_Color;
    v_TexCoord = a_TexCoord;
}
