// Toggle sidebar visibility
document.getElementById('open-btn').addEventListener('click', () => {
    document.getElementById('sidebar').style.left = '0';
});

document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('sidebar').style.left = '-250px';
});

// Apply configuration changes
// document.getElementById('apply-btn').addEventListener('click', () => {
//     const numParticles = parseInt(document.getElementById('numParticles').value);
//     const noise = parseFloat(document.getElementById('noise').value);
//     const stepSize = parseFloat(document.getElementById('stepSize').value);

//     // Apply the parameters in sketch.js
//     applyParameters(numParticles, noise, stepSize);
    
//     // Close the sidebar
//     document.getElementById('sidebar').style.left = '-250px';
// });
