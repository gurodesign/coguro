 class MorphingBlob {
            constructor() {
                this.path = document.getElementById('blob');
                this.container = document.getElementById('blobContainer');
                this.svg = document.getElementById('blobSvg');
                
                this.center = { x: 200, y: 200 };
                this.baseRadius = 70;
                this.points = 12;
                this.mouseInfluence = 0;
                this.mousePos = { x: 0, y: 0 };
                
                this.noise = [];
                this.angleStep = (Math.PI * 2) / this.points;
                
                // Initialize noise values for organic movement
                for (let i = 0; i < this.points; i++) {
                    this.noise.push(Math.random() * 1000);
                }
                
                this.time = 0;
                this.rotationAngle = 0;
                
                // Safari optimization: Track performance
                this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                this.frameCount = 0;
                this.lastFrameTime = performance.now();
                this.targetFPS = this.isSafari ? 30 : 60; // Reduce FPS for Safari
                this.frameInterval = 1000 / this.targetFPS;
                
                // Safari optimization: Batch DOM updates
                this.pendingPathUpdate = null;
                this.pendingRotationUpdate = null;
                
                // Safari optimization: Reduce filter complexity on Safari
                if (this.isSafari) {
                    const filter = document.getElementById('gooey');
                    if (filter) {
                        filter.querySelector('feGaussianBlur').setAttribute('stdDeviation', '1');
                    }
                }
                
                this.setupEventListeners();
                this.animate();
            }
            
            setupEventListeners() {
                // Safari optimization: Use passive listeners
                // this.container.addEventListener('mouseenter', (e) => {
                //     this.mouseInfluence = 1;
                // }, { passive: true });
                
                // this.container.addEventListener('mouseleave', (e) => {
                //     this.mouseInfluence = 0;
                // }, { passive: true });
                
                // // Safari optimization: Throttle mousemove events
                // let mouseMoveThrottle = null;
                // this.container.addEventListener('mousemove', (e) => {
                //     if (mouseMoveThrottle) return;
                    
                //     mouseMoveThrottle = setTimeout(() => {
                //         const rect = this.container.getBoundingClientRect();
                //         this.mousePos.x = e.clientX - rect.left - 200;
                //         this.mousePos.y = e.clientY - rect.top - 200;
                //         mouseMoveThrottle = null;
                //     }, this.isSafari ? 16 : 8); // Slower throttle for Safari
                // }, { passive: true });
            }
            
            createPath() {
                let pathData = '';
                const points = [];
                
                for (let i = 0; i < this.points; i++) {
                    const angle = i * this.angleStep;
                    
                    // Safari optimization: Reduce noise complexity
                    const timeMultiplier = this.isSafari ? 0.5 : 1;
                    const noiseValue1 = Math.sin(this.noise[i] + this.time * 0.010 * timeMultiplier) * 0.7 + 0.3;
                    const noiseValue2 = Math.cos(this.noise[i] * 0.7 + this.time * 0.012 * timeMultiplier) * 0.5 + 0.5;
                    const noiseValue3 = Math.sin(this.noise[i] * 1.3 + this.time * 0.008 * timeMultiplier) * 0.4 + 0.6;
                    const radius = this.baseRadius + (noiseValue1 * noiseValue2 * noiseValue3) * 80;
                    
                    // Mouse interaction effect
                    let mouseEffect = 0;
                    if (this.mouseInfluence > 0) {
                        const pointX = Math.cos(angle) * radius;
                        const pointY = Math.sin(angle) * radius;
                        const distanceToMouse = Math.sqrt(
                            Math.pow(pointX - this.mousePos.x, 2) + 
                            Math.pow(pointY - this.mousePos.y, 2)
                        );
                        mouseEffect = Math.max(0, (120 - distanceToMouse) / 120) * 50 * this.mouseInfluence;
                    }
                    
                    const finalRadius = radius + mouseEffect;
                    const x = this.center.x + Math.cos(angle) * finalRadius;
                    const y = this.center.y + Math.sin(angle) * finalRadius * 1.6;
                    
                    points.push({ x, y });
                }
                
                // Create smooth curves between points
                pathData = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
                
                for (let i = 0; i < points.length; i++) {
                    const current = points[i];
                    const next = points[(i + 1) % points.length];
                    const nextNext = points[(i + 2) % points.length];
                    
                    // Control points for ultra-smooth curves
                    const cp1x = current.x + (next.x - current.x) * 0.6;
                    const cp1y = current.y + (next.y - current.y) * 0.6;
                    const cp2x = next.x - (nextNext.x - current.x) * 0.3;
                    const cp2y = next.y - (nextNext.y - current.y) * 0.3;
                    
                    pathData += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`;
                }
                
                pathData += ' Z';
                return pathData;
            }
            
            // Safari optimization: Batch DOM updates
            updateDOM() {
                if (this.pendingPathUpdate) {
                    this.path.setAttribute('d', this.pendingPathUpdate);
                    this.pendingPathUpdate = null;
                }
                
                if (this.pendingRotationUpdate !== null) {
                    // Safari optimization: Use transform3d for hardware acceleration
                    this.svg.style.transform = `rotate(${this.pendingRotationUpdate.toFixed(2)}deg) translateZ(0)`;
                    this.pendingRotationUpdate = null;
                }
            }
            
            animate() {
                const currentTime = performance.now();
                const deltaTime = currentTime - this.lastFrameTime;
                
                // Safari optimization: Frame rate limiting
                if (deltaTime < this.frameInterval) {
                    requestAnimationFrame(() => this.animate());
                    return;
                }
                
                this.time += 1;
                
                // Update noise values for dramatic morphing
                const noiseIncrement = this.isSafari ? 0.005 : 0.007; // Slower for Safari
                for (let i = 0; i < this.noise.length; i++) {
                    this.noise[i] += noiseIncrement + Math.sin(this.time * 0.001) * 0.003;
                }
                
                // Smooth mouse influence transition
                const targetInfluence = this.mouseInfluence > 0.1 ? 1 : 0;
                this.mouseInfluence += (targetInfluence - this.mouseInfluence) * 0.1;
                
                // Update blob shape
                this.pendingPathUpdate = this.createPath();
                
                // Update rotation
                const rotationSpeed = this.isSafari ? 0.2 : 0.3; // Slower rotation for Safari
                this.rotationAngle += rotationSpeed;
                this.pendingRotationUpdate = this.rotationAngle;
                
                // Safari optimization: Batch DOM updates
                this.updateDOM();
                
                this.lastFrameTime = currentTime;
                this.frameCount++;
                
                requestAnimationFrame(() => this.animate());
            }
        }
        
        // Initialize the blob when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new MorphingBlob();
        });