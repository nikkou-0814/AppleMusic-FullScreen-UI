let lyrics = document.querySelectorAll('.lyric');
let lyricsContainer = document.querySelector('.lyrics');
let index = 0;

function animateLyrics() {
    lyrics.forEach((lyric, i) => {
        lyric.classList.remove('current');
        
        if (i === index) {
            lyric.classList.add('current');
            scrollToCurrentLyric(lyric);
        }

        if (i === index - 1) {
            lyric.classList.add('slide-out');
        }
    });

    index = (index + 1) % lyrics.length;
}

setInterval(animateLyrics, 2000);

function scrollToCurrentLyric(lyric) {
    if (!lyricsContainer) return;

    const containerHeight = lyricsContainer.clientHeight;
    const lyricPosition = lyric.offsetTop;
    const lyricHeight = lyric.clientHeight;

    const scrollPosition = Math.max(0, Math.min(lyricPosition - (containerHeight / 4.5), lyricsContainer.scrollHeight - containerHeight));

    const startPosition = lyricsContainer.scrollTop;
    const distance = scrollPosition - startPosition;
    
    const duration = 1000;
    const startTime = performance.now();

    function animateScroll(currentTime) {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            const easeProgress = cubicBezier(0.22, 1, 0.36, 1, progress);
            lyricsContainer.scrollTop = startPosition + distance * easeProgress;
            requestAnimationFrame(animateScroll);
        } else {
            lyricsContainer.scrollTop = scrollPosition;
        }
    }

    requestAnimationFrame(animateScroll);
}

function cubicBezier(x1, y1, x2, y2, t) {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;

    function sampleCurveX(t) {
        return ((ax * t + bx) * t + cx) * t;
    }

    function sampleCurveY(t) {
        return ((ay * t + by) * t + cy) * t;
    }

    function solveCurveX(x) {
        let t0 = 0;
        let t1 = 1;
        let t2 = x;
        let x2;
        for (let i = 0; i < 8; i++) {
            x2 = sampleCurveX(t2) - x;
            if (Math.abs(x2) < 1e-6) return t2;
            let d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
            if (Math.abs(d2) < 1e-6) break;
            t2 = t2 - x2 / d2;
        }
        if (t2 < t0) return t0;
        if (t2 > t1) return t1;
        while (t0 < t1) {
            x2 = sampleCurveX(t2);
            if (Math.abs(x2 - x) < 1e-6) return t2;
            if (x > x2) t0 = t2;
            else t1 = t2;
            t2 = (t1 - t0) * 0.5 + t0;
        }
        return t2;
    }

    return sampleCurveY(solveCurveX(t));
}
