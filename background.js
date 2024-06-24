document.addEventListener('DOMContentLoaded', () => {
    const colorThief = new ColorThief();
    const img = document.getElementById('albumArt');

    let scene, camera, renderer, geometry, material, mesh;

    function init(colors) {
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gradient-canvas'), alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        geometry = new THREE.PlaneGeometry(2, 2);

        const uniforms = {
            u_time: { type: "f", value: 1.0 },
            u_resolution: { type: "v2", value: new THREE.Vector2() },
            u_color1: { type: "v3", value: new THREE.Vector3(colors[0][0]/255, colors[0][1]/255, colors[0][2]/255) },
            u_color2: { type: "v3", value: new THREE.Vector3(colors[1][0]/255, colors[1][1]/255, colors[1][2]/255) },
            u_color3: { type: "v3", value: new THREE.Vector3(colors[2][0]/255, colors[2][1]/255, colors[2][2]/255) },
            u_color4: { type: "v3", value: new THREE.Vector3(colors[3][0]/255, colors[3][1]/255, colors[3][2]/255) }
        };

        const fragmentShader = `
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec3 u_color1;
            uniform vec3 u_color2;
            uniform vec3 u_color3;
            uniform vec3 u_color4;

            void main() {
                vec2 st = gl_FragCoord.xy/u_resolution.xy;
                vec3 color = vec3(0.0);

                vec3 pct = vec3(st.x);

                pct.r = smoothstep(0.0, 1.0, st.x);
                pct.g = sin(st.x * 3.14 + u_time);
                pct.b = pow(st.x, 0.5);

                color = mix(u_color1, u_color2, pct);
                color = mix(color, u_color3, smoothstep(0.0, 1.0, st.y));
                color = mix(color, u_color4, smoothstep(0.0, 1.0, length(st - 0.5)));

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: fragmentShader
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);
        material.uniforms.u_time.value += 0.03;
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.u_resolution.value.x = renderer.domElement.width;
        material.uniforms.u_resolution.value.y = renderer.domElement.height;
    }

    function updateBackground() {
        if (img.complete) {
            const palette = colorThief.getPalette(img, 4);
            init(palette);
            window.addEventListener('resize', onWindowResize, false);
            onWindowResize();
        } else {
            img.addEventListener('load', updateBackground);
        }
    }

    updateBackground();
});