let nodes = [];
let anchorNodes = [];
let anchorsRequiringUpdate = [];
let numParticles = 500;

const numParticlesInput = document.getElementById('numParticles');
const showParticlesInput = document.getElementById('showParticles');
const showGRoundTruthInput = document.getElementById('showGT');
const updateMeshInput = document.getElementById('updateMesh');
const clickupateInput = document.getElementById('clickupdate');
const addModeInput = document.getElementById('addMode');
const varianceScaler = document.getElementById("varianceScaler");
const varianceScalerValue = document.getElementById("varianceScalerValue");
const meshButton = document.getElementById("mesh-btn");
const anchorButton = document.getElementById("anchor-btn");

varianceScaler.addEventListener("input", function() {
    varianceScalerValue.textContent = varianceScaler.value;
    nodes.forEach(node => {
        node.VarianceScale = varianceScaler.value;
    });
});


numParticlesInput.addEventListener('change', () => {
    numParticles = parseInt(numParticlesInput.value);
    nodes.forEach(node => {
        node.numParticles = numParticles;
    });
});

meshButton.addEventListener('click', () => {
    nodes.forEach(node => {
        nodes.forEach(node2 => {
            if (node.id !== node2.id) {
                node.updateParticles(node2);
            }
        });
    });
});

anchorButton.addEventListener('click', () => {
    anchorNodes.forEach(anchor => {
        nodes.forEach(node => {
            node.updateParticles(anchor);
        });
    });
});

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Create an initial node with ID 1 and 500 particles
    nodes.push(new Node(1, width / 2, height / 2, numParticles));
}

function draw() {
    background(128);

    // Draw each node
    nodes.forEach(node => {
        // node.updateParticles(anchorNodes);
        const drawParticles = showParticlesInput.checked;
        const drawGroundTruth = showGRoundTruthInput.checked;
        node.draw(drawParticles, drawGroundTruth);
    });

    // // Draw anchor nodes
    anchorNodes.forEach(anchor => {
        anchor.draw();
    });
}

// detect user keyboard input
function keyPressed() {
    if (keyCode === DELETE) {
        // Remove the last node in the list
        nodes.pop();
    }
    // letter A
    if (key === 'a') {
    //  change the menu to add anchor
        addModeInput.selectedIndex = 0;
    }
    // letter N
    if (key === 'n') {
    //  change the menu to add node
        addModeInput.selectedIndex = 1;
    }
    if (key === 'o') {
        //  change the menu to add nothing
            addModeInput.selectedIndex = 2;
        }
    // letter P
    if (key === 'p') {
        showParticlesInput.checked = !showParticlesInput.checked;
    }
    if(key === 't'){
        showGRoundTruthInput.checked = !showGRoundTruthInput.checked;
    }
    // letter U
    if (key === 'u') {
        updateMeshInput.checked = !updateMeshInput.checked;
    }
    // letter C
    if (key === 'c') {
        clickupateInput.checked = !clickupateInput.checked;
    }
    // letter M
    if (key === 'm') {
        nodes.forEach(node => {
            nodes.forEach(node2 => {
                if (node.id !== node2.id) {
                    node.updateParticles(node2);
                }
            });
        });
    }
    // letter l
    if (key === 'l') {
        anchorNodes.forEach(anchor => {
            nodes.forEach(node => {
                node.updateParticles(anchor);
            });
        });
    }

}

function isValidClick() {
    const menuButtonX = 20;
    const menuButtonY = 20;
    const menuButtonWidth = 40;
    const menuButtonHeight = 40;

    // Check if mouse is within the bounds of the menu button
    const isClickOnMenuButton = 
        mouseX >= menuButtonX && 
        mouseX <= menuButtonX + menuButtonWidth && 
        mouseY >= menuButtonY && 
        mouseY <= menuButtonY + menuButtonHeight;

    // Check if sidebar is open
    const sidebar = document.getElementById("sidebar");
    const isSidebarOpen = sidebar.style.left === "0px";

    // If the sidebar is open, check if the click is inside its bounds
    if (isSidebarOpen) {
        const sidebarWidth = sidebar.offsetWidth;

        // Check if the click is within the sidebar's width (left side of the screen)
        const isClickOnSidebar = mouseX <= sidebarWidth;

        // Return false if the click is within the sidebar or the menu button
        return !isClickOnSidebar && !isClickOnMenuButton;
    }

    // If the sidebar is closed, return true only if the click is not on the menu button
    return !isClickOnMenuButton;
}


function mousePressed() {
    if (isValidClick()) {
        if (addModeInput.options[addModeInput.selectedIndex].value === "anchor") {
            let new_anchor = new Node(anchorNodes.length + 1, mouseX, mouseY, 0, true);
            anchorNodes.push(new_anchor);
            anchorsRequiringUpdate.push(new_anchor);
            if (clickupateInput.checked) {
                anchorsRequiringUpdate.forEach(anchor => {
                    nodes.forEach(node => {
                        node.updateParticles(anchor);
                    }); 
                });
                // empty the list of anchors requiring update
                anchorsRequiringUpdate = [];
            }
        } else if (addModeInput.options[addModeInput.selectedIndex].value === "node") {
            let new_node = new Node(nodes.length + 1, mouseX, mouseY, numParticles);
            nodes.push(new_node);
        }
        if (updateMeshInput.checked && nodes.length > 0 && clickupateInput.checked) {
            nodes.forEach(node => {
                nodes.forEach(node2 => {
                    if (node.id !== node2.id) {
                        node.updateParticles(node2);
                    }
                });
            });
        }

        
    }
}


// Resize canvas when window is resized
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Node class
class Node {
    constructor(id, x, y, numParticles, isanchor=false) {
        this.id = id;
        this.position = createVector(x, y);
        // this.estimated = createVector(,y);
        if(isanchor) {
            this.estimated = createVector(x, y);
            this.variance = 5;
        } else{
            this.estimated = createVector(random(width), random(height));
            this.variance = 1000;
        }
        this.numParticles = numParticles;
        this.particles = [];
        this.isanchor = isanchor;
        this.VarianceScale = 0.1;
    }

    draw(drawParticles, drawGroundTruth) {
        // Draw the true position of the node with a label
        if (!this.isanchor) {
            if (drawGroundTruth) {
                fill(255, 0, 0, 60);
                ellipse(this.position.x, this.position.y, 20, 20);
                fill(255);
                textSize(12);
                textAlign(CENTER, CENTER);
                text(this.id, this.position.x, this.position.y);
            }
            if (drawParticles && this.particles.length > 0) {
                // Draw particles
                this.particles.forEach(particle => {
                    fill(128, 128, 128, 150 * particle.weight);
                    ellipse(particle.position.x, particle.position.y, particle.weight*10, particle.weight*10);
                    fill(255);
                    textSize(10);
                    textAlign(CENTER, CENTER);
                    text(particle.weight.toFixed(2), particle.position.x, particle.position.y);
                });
            }
            // draw a green circle at the estimated position
            fill(0, 255, 0, 60);
            ellipse(this.estimated.x, this.estimated.y, this.variance, this.variance);
            fill(255);
            textSize(12);
            textAlign(CENTER, CENTER);
            text(this.id, this.estimated.x, this.estimated.y);
        } else {
            fill(0, 0, 255);
            ellipse(this.position.x, this.position.y, 10, 10);
            fill(255);
            textSize(12);
            textAlign(CENTER, CENTER);
            text(this.id, this.position.x, this.position.y);
        }
    }

    initParticules(anchor, M_distance){
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                    position: p5.Vector.add(anchor.estimated , p5.Vector.random2D().normalize().mult(M_distance+randomGaussian(0, anchor.variance))),
                    weight: 1/this.numParticles
            });
        }
    }

    updateParticles(anchor) {
        //  calculate the distance between the node and the anchor
        let Measured_distance = dist(this.position.x, this.position.y, anchor.estimated.x, anchor.estimated.y) + randomGaussian(0, anchor.variance);
        //  if particules are not initialized, do it so that they are around the anchor node, use circle fomula to get a random point around the anchor
        if (this.particles.length === 0 && !anchor.isanchor) {
            console.log("only init after one anchor");
            return;
        }
        let sum_w = 0;
        if (this.particles.length === 0 || isNaN(this.variance)) {
            this.initParticules(anchor, Measured_distance);
            sum_w = 1;
        } else{
            // Update the particles based on the distance from the anchor node
            this.particles.forEach(particle => {
                let distance = dist(particle.position.x, particle.position.y, anchor.estimated.x, anchor.estimated.y);
                //  if distance is "likely" to be the measured distance, update the weight to better reflect that
                const error = abs(Measured_distance - distance);
                //  knwoning that error should be a gaussian distribution, we can calculate the likelyhood of the error
                const likelyhood = exp(-error * error / (2 * anchor.variance * anchor.variance));
                // console.log(likelyhood);
                // particle.weight = likelyhood;
                // if likelyhood is within 95% of the error, we can consider it as a good estimation and update the particule to be closer to the desired position
                // if (likelyhood > 0.1) {
                //     console.log("updating", error);
                //     let nVect = p5.Vector.sub(anchor.position, particle.position).normalize(); // this vector points from the anchor to the particle
                //     particle.position.add(nVect.mult(error*likelyhood*4));
                // }
                sum_w += likelyhood;
                particle.weight = likelyhood;
            });
            //  if estimations are too bad (sum_w is too low), we need to resample the particles
            if(sum_w <=0.001){
                this.initParticules(anchor, Measured_distance);
            }
        }
        //  estimate the position of the node
        let estimated = createVector(0, 0);
        this.particles.forEach(particle => {
            estimated.add(p5.Vector.mult(particle.position, particle.weight / sum_w));
        });

        this.estimated = estimated;
        // estimate the variance of the node
        let variance = 0;
        this.particles.forEach(particle => {
            variance += (particle.weight/sum_w) * dist(particle.position.x, particle.position.y, estimated.x, estimated.y);
        });
        this.variance = variance;
        console.log("variance of node", this.id, "is", this.variance);
        if (isNaN(this.variance)) {
            console.log("variance is nan");
            console.log("sum_w", sum_w);
            console.log("estimated", estimated);
            console.log("reinitiating particles");
            this.initParticules(anchor, Measured_distance);
        }


        //  resample using low variance resampling
        let new_particles = [];
        const N = this.numParticles;
        const w = sum_w;
        const w_target = w/N;
        let r = random(0, w_target);
        let c = this.particles[0].weight;
        let i = 0;
        for (let m = 0; m < N; m++) {
            let U = r + m*w_target;
            while (U > c) {
                i += 1;
                i = i % N;
                c += this.particles[i].weight;
            }
            // Clone particle to avoid reference issues
            let chosen = this.particles[i];
            let newparticule = {position: createVector(chosen.position.x, chosen.position.y), weight: chosen.weight};
            newparticule.position.add(p5.Vector.random2D().mult(randomGaussian(0, 10*this.VarianceScale)));
            new_particles.push(newparticule);
            // new_particles.push(this.particles[i]);
        }
        this.particles = new_particles;
        // console.log(this.particles.length);
    }
}
