import * as THREE from "three";

export interface TVDesign {
  name: string;
  size: "small" | "medium" | "large";
  casingColor: number;
  hasWoodGrain?: boolean;
  woodColor?: number;
  knobColor: number;
  knobPosition: "bottom" | "right" | "left";
}

export class VintageTV {
  private tvGroup: THREE.Group;
  private screenMaterial!: THREE.MeshBasicMaterial | THREE.ShaderMaterial;
  private videoElement!: HTMLVideoElement;
  private videoTexture!: THREE.VideoTexture;
  private isPlaying: boolean = false;
  private design: TVDesign;

  constructor(design?: TVDesign) {
    this.design = design || this.getRandomDesign();
    this.tvGroup = new THREE.Group();
    this.createVideoElement();
    this.setupVideoTexture();
    this.createTVModel();
  }

  private getRandomDesign(): TVDesign {
    const colors = [0xffd700, 0xff4444, 0xff8800, 0xc0c0c0, 0x444444, 0x8b4513, 0xf5deb3, 0xf8f8ff];
    const knobColors = [0x444444, 0x222222, 0x333333, 0x666666, 0x888888];
    const sizes: TVDesign["size"][] = ["small", "medium", "large"];
    const positions: TVDesign["knobPosition"][] = ["bottom", "right", "left"];
    
    return {
      name: `TV-${Math.floor(Math.random() * 1000)}`,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      casingColor: colors[Math.floor(Math.random() * colors.length)],
      hasWoodGrain: Math.random() > 0.7,
      woodColor: 0x654321,
      knobColor: knobColors[Math.floor(Math.random() * knobColors.length)],
      knobPosition: positions[Math.floor(Math.random() * positions.length)],
    };
  }

  private getSizeDimensions(size: string) {
    const dimensions = {
      small: { screen: { width: 0.6, height: 0.45 }, casing: { width: 0.8, height: 0.6, depth: 0.2 }},
      medium: { screen: { width: 0.8, height: 0.6 }, casing: { width: 1.0, height: 0.75, depth: 0.25 }},
      large: { screen: { width: 1.0, height: 0.75 }, casing: { width: 1.2, height: 0.9, depth: 0.3 }}
    };
    return dimensions[size as keyof typeof dimensions];
  }

  private createVideoElement(): void {
    this.videoElement = document.createElement("video");
    this.videoElement.crossOrigin = "anonymous";
    this.videoElement.loop = true;
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;
    this.videoElement.preload = "auto";
    this.videoElement.src = "./src/videos/night-watch.mp4";

    this.videoElement.addEventListener("error", (e) => {
      console.error("Video loading error:", e);
    });

    this.videoElement.addEventListener("canplay", () => {});

    this.videoElement.style.display = "none";
    document.body.appendChild(this.videoElement);
  }

  private setupVideoTexture(): void {
    this.videoTexture = new THREE.VideoTexture(this.videoElement);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    this.videoTexture.format = THREE.RGBAFormat;
    this.videoTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.videoTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.videoTexture.generateMipmaps = false;
    this.videoTexture.needsUpdate = true;
  }

  private createTVModel(): void {
    const { casingColor, knobColor } = this.design;
    const dims = this.getSizeDimensions(this.design.size);
    
    const casingGeometry = new THREE.BoxGeometry(dims.casing.width, dims.casing.height, dims.casing.depth);
    const casingMaterial = new THREE.MeshLambertMaterial({ 
      color: this.design.hasWoodGrain ? this.design.woodColor || casingColor : casingColor 
    });
    const casing = new THREE.Mesh(casingGeometry, casingMaterial);
    this.tvGroup.add(casing);

    const screenGeometry = new THREE.PlaneGeometry(dims.screen.width, dims.screen.height);
    this.screenMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const screen = new THREE.Mesh(screenGeometry, this.screenMaterial);
    screen.position.set(0, 0, dims.casing.depth / 2 + 0.01);
    screen.name = "TVScreen";
    this.tvGroup.add(screen);

    this.createControlKnobs(knobColor, dims.casing);
  }


  private createControlKnobs(knobColor: number, casingSize: any): void {
    const knobCount = Math.floor(Math.random() * 2) + 1;
    const positions = {
      bottom: (i: number) => [-casingSize.width * 0.3 + i * 0.15, -casingSize.height * 0.4, 0],
      right: (i: number) => [casingSize.width * 0.4, -casingSize.height * 0.3 + i * 0.1, Math.PI / 2],
      left: (i: number) => [-casingSize.width * 0.4, -casingSize.height * 0.3 + i * 0.1, -Math.PI / 2]
    };
    
    for (let i = 0; i < knobCount; i++) {
      const knob = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.02, 6),
        new THREE.MeshLambertMaterial({ color: knobColor })
      );
      const [x, y, rot] = positions[this.design.knobPosition as keyof typeof positions](i);
      knob.position.set(x, y, casingSize.depth / 2 + 0.01);
      if (rot) knob.rotation.y = rot;
      this.tvGroup.add(knob);
    }
  }


  public playVideo(): void {
    if (!this.isPlaying) {
      this.videoElement
        .play()
        .then(() => {
          this.isPlaying = true;
          if (this.screenMaterial instanceof THREE.MeshBasicMaterial) {
            this.screenMaterial.map = this.videoTexture;
            this.screenMaterial.needsUpdate = true;
          }
          this.videoTexture.needsUpdate = true;
        })
        .catch((error) => {
          console.error(
            `Failed to play video on ${this.design.name} TV:`,
            error
          );
        });
    }
  }

  public pauseVideo(): void {
    if (this.isPlaying) {
      this.videoElement.pause();
      this.isPlaying = false;
    }
  }

  public stopVideo(): void {
    this.videoElement.pause();
    this.videoElement.currentTime = 0;
    this.isPlaying = false;
    if (this.screenMaterial instanceof THREE.MeshBasicMaterial) {
      this.screenMaterial.map = null;
      this.screenMaterial.color.setHex(0xffffff);
      this.screenMaterial.needsUpdate = true;
    }
  }

  public toggleVideo(): void {
    if (this.isPlaying) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  public forceUpdateVideoTexture(): void {
    if (this.isPlaying) {
      if (this.screenMaterial instanceof THREE.MeshBasicMaterial) {
        this.screenMaterial.map = this.videoTexture;
        this.screenMaterial.needsUpdate = true;
      }
      this.videoTexture.needsUpdate = true;
    }
  }

  public getTVGroup(): THREE.Group {
    return this.tvGroup;
  }

  public getVideoElement(): HTMLVideoElement {
    return this.videoElement;
  }

  public isVideoPlaying(): boolean {
    return this.isPlaying;
  }

  public getDesign(): TVDesign {
    return this.design;
  }

  public dispose(): void {
    this.stopVideo();
    if (this.videoElement && this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
    }
    if (this.videoTexture) {
      this.videoTexture.dispose();
    }
    if (this.screenMaterial) {
      this.screenMaterial.dispose();
    }
  }
}
