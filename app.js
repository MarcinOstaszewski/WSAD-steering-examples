window.addEventListener("DOMContentLoaded", function () {

    let size = 40;
    let change = 4;
    let veloChg = 0.3;
    let maxRotChg = 4;
    let pressed = {};
    let veloH = 0;
    let veloV = 0;
    let rotation = 0;
    let degToRadians = Math.PI / 180;
    let chgRotation = 0;
    let delay = 0;
    let wIW = window.innerWidth;
    let wIH = window.innerHeight;
    let ship = document.getElementById('ship');
    let interval, int;
    let frameLength = 16;
    let indicator = document.getElementById('indicator');

    let switches = document.querySelectorAll('.switchSteering');
    switches.forEach( swi => {swi.onclick = (e) => {switchSteering(e);}});

    ship.style.top =  (wIH / 2 ) + "px";
    ship.style.left = (wIW / 2) + "px";
    ship.style.width = size + "px";
    ship.style.height = size + "px";

    removeRotation = (sign) => {
        if (Math.abs(rotation) > 14) {
            console.log(rotation, sign, Math.abs(rotation) > 10)
            int = setTimeout(function(){rotation = rotation - (10 * sign); removeRotation(sign)}, frameLength);
        } else {
            window.clearTimeout(int);
            rotation = 0;
        }
        ship.style.transform = "rotate(" + rotation + "deg)";
    }

    function switchSteering(e) {
        window.clearInterval(interval);
        switches.forEach( elem => {
            elem.classList.remove('active');
        })
        document.getElementById(e.currentTarget.id).classList.add('active');
        switch (e.currentTarget.id) {
            case "Tank":
                interval = window.setInterval(moveTank, frameLength);
                break;
            case "SpaceShip":
                if (rotation != 0) { removeRotation(Math.sign(rotation))}
                interval = window.setInterval(moveSpaceShip, frameLength);
                break;
            case "Turtle":
                interval = window.setInterval(moveTurtle, frameLength);
                break;
        }
    }
    
    function moveTank() {
        let keys = Object.keys(pressed);
        let top = Number(ship.style.top.slice(0, -2));
        let left = Number(ship.style.left.slice(0, -2)); 
        
        if (keys.includes("w")) {
            veloH -= veloChg * Math.cos(rotation * degToRadians);
            veloV += veloChg * Math.sin(rotation * degToRadians);
        }
        if (keys.includes("s")) {
            veloH += veloChg * Math.cos(rotation * degToRadians);
            veloV -= veloChg * Math.sin(rotation * degToRadians);
        }

        if (keys.includes("a")) {
            chgRotation -= 1;
        }
        if (keys.includes("d")) {
            chgRotation += 1;
        }
        if (Math.abs(veloV) > 0.1) {
            veloV = veloV * 0.97;
        } else {
            veloV = 0;
        }
        if (Math.abs(veloH) > 0.1 ) {
            veloH = veloH * 0.97;
        } else {
            veloH = 0;
        }
        if (chgRotation > maxRotChg) {
            chgRotation = maxRotChg;
        } else if (chgRotation < -maxRotChg) {
            chgRotation = -maxRotChg;
        } else {
            if (Math.abs(chgRotation) > 0.1) {
                chgRotation = chgRotation * 0.97;
            } else {
                chgRotation = 0;
            }
        }

        ship.style.top = (top + veloH) + "px";
        ship.style.left = (left + veloV) + "px";
        rotation += chgRotation;
        rotation = rotation % 360;
        if (rotation < -180) { rotation = rotation + 360 }
        indicator.innerText = rotation.toFixed(0);
        ship.style.transform = "rotate(" + rotation + "deg)";
    }

    function moveSpaceShip() {
        let keys = Object.keys(pressed);
        let top = Number(ship.style.top.slice(0, -2));
        let left = Number(ship.style.left.slice(0, -2));
        let moveH = 0, moveV = 0;

        if (keys.includes("a") && left > 0) {
            moveH -= change;
        }
        if (keys.includes("d") && left < wIW - size) {
            moveH += change;
        }
        if (keys.includes("w") && top > 0) {
            moveV -= change;
        }
        if (keys.includes("s") && top < wIH - size) {
            moveV += change;
        }
        ship.style.left = (left + moveH) + "px";
        ship.style.top = (top + moveV) + "px";
    }

    let moveTurtle = () => { 
        delay == 0 ? delay = 60 : delay--;
    }

    document.onkeyup = (e) => { delete pressed[e.key]; }
    document.onkeydown = (e) => {
        pressed[e.key] = 1;
    }

});
