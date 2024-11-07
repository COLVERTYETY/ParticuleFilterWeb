let nodes = [];
let anchorNodes = [];
let numParticles = 500;

const numParticlesInput = document.getElementById('numParticles');
// const noiseInput = document.getElementById('noise');
const stepSizeInput = document.getElementById('stepSize');
const showParticlesInput = document.getElementById('showParticles');
const updateMeshInput = document.getElementById('updateMesh');
const clickupateInput = document.getElementById('clickupdate');
const addModeInput = document.getElementById('addMode');

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
        node.draw(drawParticles);
    });

    // // Draw anchor nodes
    anchorNodes.forEach(anchor => {
        anchor.draw();
    });
}


function mousePressed() {
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

    if (!isSidebarOpen && !isClickOnMenuButton) {
        if (addModeInput.options[addModeInput.selectedIndex].value === "anchor") {
            let new_anchor = new Node(anchorNodes.length + 1, mouseX, mouseY, 0, true);
            anchorNodes.push(new_anchor);
            if (clickupateInput.checked) {
                nodes.forEach(node => {
                    node.updateParticles(new_anchor);
                }); 
            }
        } else if (addModeInput.options[addModeInput.selectedIndex].value === "node") {
            let new_node = new Node(nodes.length + 1, mouseX, mouseY, numParticles);
            nodes.push(new_node);
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
            this.variance = random(1, 500);
        }
        this.numParticles = numParticles;
        this.particles = [];
        this.isanchor = isanchor;

        // Initialize particles with random positions and weights
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                position: createVector(random(width), random(height)),
                weight: 1/numParticles
            });
        }
    }

    draw(drawParticles) {
        // Draw the true position of the node with a label
        if (!this.isanchor) {
            fill(255, 0, 0, 60);
            ellipse(this.position.x, this.position.y, 20, 20);
            fill(255);
            textSize(12);
            textAlign(CENTER, CENTER);
            text(this.id, this.position.x, this.position.y);
            if (drawParticles) {
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
            ellipse(this.estimated.x, this.estimated.y, 20, 20);
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

    updateParticles(anchor) {
        // Standard deviation for Gaussian noise
        // const sigma = 5;
        // Update the particles based on the distance from the anchor node
        let Measured_distance = dist(this.position.x, this.position.y, anchor.estimated.x, anchor.estimated.y) + randomGaussian(0, anchor.variance);
        // let cum_weight = 0;
        let sum_w = 0;
        this.particles.forEach(particle => {
            let distance = dist(particle.position.x, particle.position.y, anchor.position.x, anchor.position.y);
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
                c += this.particles[i].weight;
            }
            // Clone particle to avoid reference issues
            let chosen = this.particles[i];
            let newparticule = {position: createVector(chosen.position.x, chosen.position.y), weight: chosen.weight};
            newparticule.position.add(p5.Vector.random2D().mult(randomGaussian(0, 10)));
            new_particles.push(newparticule);
            // new_particles.push(this.particles[i]);
        }
        this.particles = new_particles;
        // console.log(this.particles.length);
    }
}
