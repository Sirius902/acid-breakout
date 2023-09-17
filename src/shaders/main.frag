precision mediump float;

uniform bool u_Rainbow;
uniform bool u_UseSampler;
uniform sampler2D u_Sampler;

uniform vec2 u_Resolution;
uniform float u_Time;

varying vec4 v_Color;
varying vec2 v_TexCoord;

// Using formula from here https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB to convert from HSV to RGB.
vec3 hsvToRgb(vec3 inHsv) {
    const float tau = radians(360.0);
    vec3 hsv = vec3(mod(inHsv.x, tau), mod(inHsv.y, tau), mod(inHsv.z, tau));
    float chroma = hsv.y * hsv.z;
    float x = chroma * (1.0 - abs(mod(hsv.x / radians(60.0), 2.0) - 1.0));
    float m = hsv.z - chroma;

    float r, g, b;
    if (hsv.x >= 0.0 && hsv.x < radians(60.0)) {
        r = chroma;
        g = x;
        b = 0.0;
    } else if (hsv.x >= radians(60.0) && hsv.x < radians(120.0)) {
        r = x;
        g = chroma;
        b = 0.0;
    } else if (hsv.x >= radians(120.0) && hsv.x < radians(180.0)) {
        r = 0.0;
        g = chroma;
        b = x;
    } else if (hsv.x >= radians(180.0) && hsv.x < radians(240.0)) {
        r = 0.0;
        g = x;
        b = chroma;
    } else if (hsv.x >= radians(240.0) && hsv.x < radians(300.0)) {
        r = x;
        g = 0.0;
        b = chroma;
    } else if (hsv.x >= radians(300.0) && hsv.x < radians(360.0)) {
        r = chroma;
        g = 0.0;
        b = x;
    }

    return vec3(r + m, g + m, b + m);
}

void main() {
    vec2 pos = gl_FragCoord.xy / u_Resolution;
    vec2 texCoord = vec2(v_TexCoord.x, 1.0 - v_TexCoord.y);
    float a = u_UseSampler ? texture2D(u_Sampler, texCoord).x : 1.0;

    if (u_Rainbow) {
        gl_FragColor = vec4(hsvToRgb(vec3(pos.x * radians(360.0) + (u_Time / 1000.0), 1.0, 1.0)), a);
    } else {
        if (!u_UseSampler) a = v_Color.w;
        gl_FragColor = vec4(v_Color.xyz, a);
    }
}
