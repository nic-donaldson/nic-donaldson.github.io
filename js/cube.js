document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('cube');
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    var width = canvas.width;
    var height = canvas.height;

    var cube_points = [
        [1, 1, 1],
        [-1, 1, 1],
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, -1],
        [-1, 1, -1],
        [-1, -1, -1],
        [1, -1, -1]];


    var square_points = [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1]];

    var scaleArr = function (arr, c) {
        return arr.map(function (x) { return x*c; });
    };

    var scale = 80;
    var square = square_points.map(function (x) { return scaleArr(x, scale); });
    var cube = cube_points.map(function (x) { return scaleArr(x, scale); });

    function matvec(m1, vec, n, p) {
        var m3 = [];
        for (var row = 0; row < n; row++) {
            var res = 0;
            for (var col = 0; col < p; col++) {
                res += m1[row][col]*vec[col];
            }
            m3.push(res);
        }
        return m3;
    }

    function matmul(m1, m2, n, p, d) {
        if (d === 1) {
            return matvec(m1, m2, n, p);
        }
        var m3 = [];
        for (var row = 0; row < n; row++) {
            m3.push([]);
            for (var col = 0; col < d; col++) {
                var res = 0;
                for (var x = 0; x < p; x++) {
                    res += m1[row][x]*m2[x][col];
                }
                m3[row].push(res);
            }
        }
        return m3;
    }

    function rot_matrix2(theta) {
        return [[Math.cos(theta), -Math.sin(theta)],
                [Math.sin(theta), Math.cos(theta)]];
    }

    function rx3(theta) {
        return [[1, 0, 0],
                [0, Math.cos(theta), -Math.sin(theta)],
                [0, Math.sin(theta), Math.cos(theta)]];
    }

    function ry3(theta) {
        return [[Math.cos(theta), 0, Math.sin(theta)],
                [0, 1, 0],
                [-Math.sin(theta), 0, Math.cos(theta)]];
    }

    function draw_line(p1, p2) {
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.closePath();
        ctx.stroke();
    }

    function clear() {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    var t = 0;
    function update(delta) {
        t += delta/1000;
        //square = square_points.map(function (x) { return matmul(rot_matrix2(t), x, 2, 2, 1); });
        //square = square.map(function (x) { return scaleArr(x, scale); });

        cube = cube_points.map(function (x) { return matmul(rx3(0.8*t), x, 3, 3, 1); });
        cube = cube.map(function (x) { return matmul(ry3(t), x, 3, 3, 1); });
        cube = cube.map(function (x) { return scaleArr(x, scale); });

        var red = Math.floor(200 - 100*Math.sin(t/3));
        var green = Math.floor(200 - 100*Math.sin(t/3.5));
        var blue = Math.floor(200 - 100*Math.sin(t/4.0));

        ctx.strokeStyle = 'rgb(' + red.toString() + ',' + blue.toString() + ',' + green.toString() + ')';
        //ctx.strokeStyle = 'rgb(255, 255, 255)';
    }


    function render() {
        ctx.save();

        ctx.translate(width/2, height/2);
        ctx.scale(1, -1);


        draw_line(cube[0], cube[1]);
        draw_line(cube[1], cube[2]);
        draw_line(cube[2], cube[3]);
        draw_line(cube[3], cube[0]);
        draw_line(cube[4], cube[5]);
        draw_line(cube[5], cube[6]);
        draw_line(cube[6], cube[7]);
        draw_line(cube[7], cube[4]);

        draw_line(cube[0], cube[4]);
        draw_line(cube[3], cube[7]);
        draw_line(cube[2], cube[6]);
        draw_line(cube[1], cube[5]);


        ctx.restore();
    }

    var g_time = 0;

    function loop(time) {
        var delta = time - g_time;
        if (g_time !== 0) {
            g_time = time;
            clear();
            update(delta);
            render();
        } else {
            g_time = time;
        }
        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
});
