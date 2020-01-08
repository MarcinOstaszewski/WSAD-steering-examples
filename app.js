window.addEventListener("DOMContentLoaded", function () {

    let size = 40;
    let change = 4;
    let veloChg = 0.3;
    let maxRotChg = 4;
    let pressed = {};
    let veloH = 0;
    let veloV = 0;
    let rotation = 0;
    let bounceFactor = -0.33;
    let degToRadians = Math.PI / 180;
    let chgRotation = 0;
    let wIW, wIH;
    let ship = document.getElementById('ship');
    let interval, bulletInterval, timesLeft, int, delayA=0, delayD=0, delaySpace=0, gradualChgD=0, gradualChgA=0;
    let frameLength = 16;
    // let indicator = document.getElementById('indicator');
    let switches = document.querySelectorAll('.switchSteering');
    let bullet = document.getElementById('bullet');
    let changer;
    let flapLeft, flapRight, rearRight, rearLeft, head; // animated Turtle parts
    switches.forEach( swi => {swi.onclick = (e) => {switchSteering(e);}});

    removeRotation = (sign) => {
        if (Math.abs(rotation) > 5) {
            int = setTimeout(function(){rotation = rotation - (4 * sign); removeRotation(sign)}, frameLength);
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
        veloH = 0; veloV = 0;
        switch (e.currentTarget.id) {
            case "Tank":
                interval = window.setInterval(moveTank, frameLength);
                ship.classList = "tank";
                break;
            case "SpaceShip":
                if (rotation != 0) { removeRotation(Math.sign(rotation))}
                    interval = window.setInterval(moveSpaceShip, frameLength);
                    ship.classList = "ship";
                break;
            case "Turtle":
                interval = window.setInterval(moveTurtle, frameLength);
                ship.classList = "turtle";
                flapRight = document.getElementById('ship').getElementsByClassName('front')[0];
                flapLeft = document.getElementById('ship').getElementsByClassName('front')[1];
                rearRight = document.getElementById('ship').getElementsByClassName('back')[0];
                rearLeft = document.getElementById('ship').getElementsByClassName('back')[1];
                head = document.getElementById('ship').querySelectorAll('.head')[0];
                break;
        }
    }
    function moveShipWithVelo(top, left) {
        ship.style.top = (top + veloH) + "px";
        ship.style.left = (left + veloV) + "px";
    }

    function verifyBounce(top, left) {
        if (top + veloH > wIH - size) { veloH *= bounceFactor; }
        if (left + veloV > wIW - size) { veloV *= bounceFactor; }
        if (top + veloH < 0) { veloH *= bounceFactor; }
        if (left + veloV < 0) { veloV *= bounceFactor; }
    }

    function verifyVelocityRotation() {
        if (Math.abs(veloV) > 0.01) {
            veloV = veloV * 0.97;
        } else {
            veloV = 0;
        }
        if (Math.abs(veloH) > 0.01) {
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
    }

    function setShipRotation() {
        rotation = rotation % 360;
        if (rotation < -180) { rotation = rotation + 360 }
        ship.style.transform = "rotate(" + rotation + "deg)";
    }

    function moveBullet(bulletHspeed, bulletVspeed) {
        if (timesLeft > 0) {
            timesLeft--;
            let x = Number(bullet.style.left.slice(0, -2));
            let y = Number(bullet.style.top.slice(0,-2));
            console.log(bulletHspeed.toFixed(1), bulletVspeed.toFixed(1),timesLeft );
            bullet.style.left = x + bulletVspeed/2.5 + "px";
            bullet.style.top = y + bulletHspeed/2.5 + "px";
            if (timesLeft == 1) {
                bullet.classList = "explosion";
            }
        } else {
            window.clearInterval(bulletInterval);
        }
    }

    function shootBullet(top, left) {
        let bulletHspeed = -28 * Math.cos(rotation * degToRadians);
        let bulletVspeed = 28 * Math.sin(rotation * degToRadians);
        bullet.style.top = (top + 14 + bulletHspeed) + "px";
        bullet.style.left = (left + 14 + bulletVspeed) + "px";
        bullet.style.transform = "rotate(" + rotation + "deg)";
        bullet.classList = 'bullet';
        window.clearInterval(bulletInterval);
        timesLeft = 60;
        bulletInterval = window.setInterval(moveBullet.bind(null,bulletHspeed, bulletVspeed), frameLength)
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
        if (delaySpace == 0) {
            bullet.classList = "";
            if (keys.includes(" ")) {
                shootBullet(top, left);
                delaySpace = 60;    
            }
        } else {
            delaySpace--;
        }
        
        verifyVelocityRotation();
        verifyBounce(top, left);
        moveShipWithVelo(top, left);
        rotation += chgRotation;
        setShipRotation()
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
        let keys = Object.keys(pressed);
        let top = Number(ship.style.top.slice(0, -2));
        let left = Number(ship.style.left.slice(0, -2));

        if (delayA == 0) {
            if (keys.includes("a")) {
                flapLeft.style.transform = "rotate(20deg)";
                delayA = 60;
                gradualChgA = 1.6;
            }
        } else if (delayA == 30) {
            flapLeft.style.transform = "";
            delayA--;
            gradualChgA = 0;
        } else if (delayA <= 60 && delayA > 0) {
            delayA--;
            (delayA > 55) ? gradualChgA *= 1.15 : gradualChgA *= 0.97;
            if (delayA > 30) { rotation += gradualChgA; }
        }
        
        if (delayD == 0) {
            if (keys.includes("d")) {
                flapRight.style.transform = "rotate(-20deg)";
                delayD = 60;
                gradualChgD = 1.6;
            }
        } else if (delayD == 30) { 
            flapRight.style.transform = "";
            delayD--;
            gradualChgD = 0;
        } else if (delayD <= 60 && delayD > 0) {
            delayD--;
            (delayD > 55) ? gradualChgD *= 1.15 : gradualChgD *= 0.97;
            if (delayD > 30) { rotation -= gradualChgD; }
        }

        if (keys.includes("w")) {
            head.style.top = "-20px"
        } else {
            head.style.top = ""
        }
        
        veloH -= (veloChg * (gradualChgA + gradualChgD) / 4) * Math.cos(rotation * degToRadians);
        veloV += (veloChg * (gradualChgA + gradualChgD) / 4) * Math.sin(rotation * degToRadians);

        if (keys.includes("s")) {
            rearRight.style.transform = "rotate(-40deg)";
            rearLeft.style.transform = "rotate(40deg)";
            veloH *= 0.96;
            veloV *= 0.96;
        } else {
            rearRight.style.transform = "";
            rearLeft.style.transform = "";
        }
        
        verifyVelocityRotation();
        verifyBounce(top, left);
        moveShipWithVelo(top, left);
        setShipRotation();        
    }

    document.onkeyup = (e) => { delete pressed[e.key]; }
    document.onkeydown = (e) => {
        pressed[e.key] = 1;
    }

    function changeScreenSize() {
        wIW = window.innerWidth;
        wIH = window.innerHeight;
    }
    window.onresize = function(){changeScreenSize()}
    changeScreenSize()

    placeShipChange = () => {
        let x = Math.random() * wIW;
        let y = Math.random() * wIH;
        changer = document.createElement('div')
        changer.id = 'changer';
        console.log(changer);
        ship.insertAdjacentElement('beforebegin', changer)
        changer.style.top = y + "px";
        changer.style.left = x + "px";
    }
    // placeShipChange();

    ship.style.top = (wIH / 2) + "px";
    ship.style.left = (wIW / 2) + "px";
});
