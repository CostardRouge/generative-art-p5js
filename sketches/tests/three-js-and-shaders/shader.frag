uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main(){
    vec2 st = gl_FragCoord.xy/u_mouse.xy;
    vec3 color = vec3(0.0);

    // chaque appel à step() renverra soit: 1.0 (blanc), soit 0.0 (noir).
    float gauche = clamp(0.1, 0.9, st.x);   // équivalent à: si( X supérieur à 0.1 )
    float bas = clamp(0.1, 0.9, st.y);; // équivalent à: si( Y supérieur à 0.1 )

    // multiplier gauche par bas revient à faire un AND logique.
    color = vec3( gauche * bas );

    gl_FragColor = vec4(color,1.0);
}
