document.addEventListener('DOMContentLoaded', () => {
    const colorThief = new ColorThief();
    const img = document.getElementById('albumArt');

    let scene, camera, renderer, uniforms;

    function init(colors) {
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gradient-canvas'), alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        uniforms = {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_colors: { value: colors.map(color => new THREE.Vector3(color[0]/255, color[1]/255, color[2]/255)) }
        };

        const geometry = new THREE.PlaneGeometry(2, 2);

        const fragmentShader = `
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec3 u_colors[4];

            // パーリンノイズ関数
            float rand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }

            float noise(vec2 p){
                vec2 ip = floor(p);
                vec2 u = fract(p);
                u = u*u*(3.0-2.0*u);

                float res = mix(
                    mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
                    mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
                return res*res;
            }

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                float n = noise(st * 5.0 - u_time * 0.1);

                vec3 color = mix(u_colors[0], u_colors[1], n);
                color = mix(color, u_colors[2], st.y);
                color = mix(color, u_colors[3], st.x);

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: fragmentShader
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);
        uniforms.u_time.value += 0.05;
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    }

    function updateBackground() {
        if (img.complete) {
            const palette = colorThief.getPalette(img, 4);
            init(palette);
            window.addEventListener('resize', onWindowResize, false);
        } else {
            img.addEventListener('load', updateBackground);
        }
    }

    updateBackground();
});
