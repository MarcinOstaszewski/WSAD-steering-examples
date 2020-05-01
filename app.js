window.addEventListener("DOMContentLoaded", function () {

    const size = 40;
    const spaceShipSpeed = 4;
    const veloChg = 0.25; // max velocity change for tank and turtle
    const maxRotChg = 2.5;
    let points = 0;
    let bonusPoints;
    let pressed = {}; // for info about pressed buttons
    let elementsAdded = {}; // for created in-game elements
    let veloH = 0; // horizontal speed for tank and turtle
    let veloV = 0;
    let rotation = 0; // for tank and turle
    let bounceFactor = -0.33; // loss of speed after collision
    let degToRadians = Math.PI / 180;
    let chgRotation = 0;
    let wIW, wIH; // window size
    let ship = document.getElementById('ship');
    let interval, bulletInterval, timesLeft, int, tmOut, delayA=0, delayD=0, delaySpace=0, gradualChgD=0, gradualChgA=0;
    let collectableColors = ['#C5DE79', '#C0DA74', '#ADC668', '#9AB15D', '#869D51', '#738846', '#60743A', '#4D602E', '#3A4B23', '#263717'] // '#D4E986', '#CFE582', '#CAE17D', 
    let frameLength = 16;
    // let indicator = document.getElementById('indicator');
    // let pointer = document.getElementById('pointer');
    let pointsDisplay = document.getElementById('points-display');
    let switches = document.querySelectorAll('.switchSteering');
    let bullet = document.getElementById('bullet');
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
                flapRight = ship.getElementsByClassName('front')[0];
                flapLeft = ship.getElementsByClassName('front')[1];
                rearRight = ship.getElementsByClassName('back')[0];
                rearLeft = ship.getElementsByClassName('back')[1];
                head = ship.querySelectorAll('.head')[0];
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

    verifyCollisions = (turtleX, turtleY) => {
        // pointer.style.top = (turtleY + 20) + 'px';
        // pointer.style.left = (turtleX + 20) + 'px';

        // Collectable
        let coll = elementsAdded['collectable'];
        let colX = parseInt(coll.style.left.slice(0, -2)) + 5;
        let colY = parseInt(coll.style.top.slice(0, -2)) + 5;
        if (Math.abs(colX - (turtleX + 20)) < 30 && Math.abs(colY - (turtleY + 20)) < 30) {
            points += bonusPoints
            pointsDisplay.innerText = points;
            coll.parentNode.removeChild(coll);
            randomlyPlaceElement('collectable');
        }
        
    }

    function verifyVelocityRotation() {
        if (Math.abs(veloV) > 0.01) {
            veloV = veloV * 0.97; // gradually slows down speed
        } else {
            veloV = 0; // stops
        }
        if (Math.abs(veloH) > 0.01) {
            veloH = veloH * 0.97;
        } else {
            veloH = 0;
        }
        if (chgRotation > maxRotChg) { // rotation cannot exceed max...
            chgRotation = maxRotChg; 
        } else if (chgRotation < -maxRotChg) { // ... in both directions
            chgRotation = -maxRotChg;
        } else {
            if (Math.abs(chgRotation) > 0.1) {
                chgRotation = chgRotation * 0.97; // gradually slowing rotation
            } else {
                chgRotation = 0;
            }
        }
    }

    function setShipRotation() { // rotating spaceship upwards the shorter way
        rotation = rotation % 360;
        if (rotation < -180) { rotation = rotation + 360 }
        ship.style.transform = "rotate(" + rotation + "deg)";
    }

    function moveBullet(bulletHspeed, bulletVspeed) {
        if (timesLeft > 0) {
            timesLeft--;
            let x = Number(bullet.style.left.slice(0, -2)); // moves bullet...
            let y = Number(bullet.style.top.slice(0,-2));
            console.log(bulletHspeed.toFixed(1), bulletVspeed.toFixed(1),timesLeft );
            bullet.style.left = x + bulletVspeed/2.5 + "px";
            bullet.style.top = y + bulletHspeed/2.5 + "px";
            if (timesLeft == 0) {
                bullet.classList = "explosion"; // ... until it explodes
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
            moveH -= spaceShipSpeed;
        }
        if (keys.includes("d") && left < wIW - size) {
            moveH += spaceShipSpeed;
        }
        if (keys.includes("w") && top > 0) {
            moveV -= spaceShipSpeed;
        }
        if (keys.includes("s") && top < wIH - size) {
            moveV += spaceShipSpeed;
        }
                ship.style.left = (left + moveH) + "px";
                ship.style.top = (top + moveV) + "px";
    }

    let moveTurtle = () => { 
        let keys = Object.keys(pressed); // keyboard buttons pressed
        let top = Number(ship.style.top.slice(0, -2)); // turtle position
        let left = Number(ship.style.left.slice(0, -2));
        if (delayA == 0) { // left flap not moving
            if (keys.includes("a")) {
                flapLeft.style.transform = "rotate(20deg)";
                delayA = 60; // frames of flap animation;
                gradualChgA = 1.3;
            }
        } else if (delayA == 30) { // left flap returns to start position
            flapLeft.style.transform = "";
            delayA--;
            gradualChgA = 0; // acceleration of movement and rotation stops
        } else if (delayA <= 60 && delayA > 0) { 
            delayA--;
            (delayA > 55) ? gradualChgA *= 1.15 : gradualChgA *= 0.97; // in the begining it's accelerating, then slowing down
            if (delayA > 30) { rotation += gradualChgA; } // firs half of flap move causes rotation
        }
        
        if (delayD == 0) { // same as above, for right flap
            if (keys.includes("d")) {
                flapRight.style.transform = "rotate(-20deg)";
                delayD = 60;
                gradualChgD = 1.3;
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
            head.style.top = "-20px" // moving head forward
        } else {
            head.style.top = ""
        }
        
        veloH -= (veloChg * (gradualChgA + gradualChgD) / 4) * Math.cos(rotation * degToRadians);
        veloV += (veloChg * (gradualChgA + gradualChgD) / 4) * Math.sin(rotation * degToRadians);

        if (keys.includes("s")) {
            rearRight.style.transform = "rotate(-40deg)";
            rearLeft.style.transform = "rotate(40deg)";
            veloH *= 0.96; // slowing down with rear flaps
            veloV *= 0.96;
        } else {
            rearRight.style.transform = "";
            rearLeft.style.transform = "";
        }
        
        verifyVelocityRotation();
        verifyCollisions(left, top);
        verifyBounce(top, left);
        moveShipWithVelo(top, left);
        setShipRotation();        
    }

    document.onkeyup = (e) => { delete pressed[e.key]; }
    document.onkeydown = (e) => pressed[e.key] = 1;

    function changeScreenSize() {
        wIW = window.innerWidth;
        wIH = window.innerHeight;
    }
    window.onresize = function(){changeScreenSize()}
    changeScreenSize();

    let startBonusPointsTimeout = () => {
        console.log(bonusPoints, collectableColors[10 - bonusPoints])
        elementsAdded['collectable'].style.backgroundColor = collectableColors[10 - bonusPoints]
        if (bonusPoints > 1)  {
            elementsAdded['collectable'].innerText = --bonusPoints;
            tmOut = setTimeout(() => { 
                window.clearTimeout(tmOut);
                startBonusPointsTimeout();
            }, 3000);
        } else {
            window.clearTimeout(tmOut);
        }
    }

    function randomlyPlaceElement(id) {
        let x = Math.floor(Math.random() * (wIW - 60) + 30);
        let y = Math.floor(Math.random() * (wIH - 60) + 30);
        let element = document.createElement('div')
        element.id = id;
        element.style.top = y + "px";
        element.style.left = x + "px";
        ship.insertAdjacentElement('beforebegin', element);
        elementsAdded[id] = element;
        if (id === 'collectable') {
            bonusPoints = 10;
            startBonusPointsTimeout()
        }
    }

    randomlyPlaceElement('collectable');

    

    ship.style.top = (wIH / 2) + "px";
    ship.style.left = (wIW / 2) + "px";

    let ev = { currentTarget: { id: 'Turtle' } }
    switchSteering(ev);
});
