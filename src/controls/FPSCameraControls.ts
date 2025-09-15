import * as THREE from "three";

export class FPSCameraControls {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private keys: { [key: string]: boolean } = {};
  private moveSpeed: number = 0.01;
  private lookSpeed: number = 0.0002;
  private isPointerLocked: boolean = false;
  private pitch: number = 0;
  private yaw: number = 0;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private acceleration: THREE.Vector3 = new THREE.Vector3();
  private friction: number = 0.95;
  private bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    minY: number;
    maxY: number;
  } = {
    minX: -7, // Updated for smaller room: -22 -> -7
    maxX: 7, // Updated for smaller room: 22 -> 7
    minZ: -7, // Updated for smaller room: -22 -> -7
    maxZ: 7, // Updated for smaller room: 22 -> 7
    minY: 1,
    maxY: 8, // Updated for smaller room: 15 -> 8
  };

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.setupEventListeners();
    this.setupPointerLock();
  }

  private keyDownHandler = this.onKeyDown.bind(this);
  private keyUpHandler = this.onKeyUp.bind(this);
  private clickHandler = this.onClick.bind(this);
  private pointerLockChangeHandler = this.onPointerLockChange.bind(this);
  private pointerLockErrorHandler = this.onPointerLockError.bind(this);
  private contextMenuHandler = (e: Event) => e.preventDefault();
  private mouseMoveHandler = this.onMouseMove.bind(this);

  private setupEventListeners(): void {
    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);
    this.domElement.addEventListener("click", this.clickHandler);
    document.addEventListener("pointerlockchange", this.pointerLockChangeHandler);
    document.addEventListener("pointerlockerror", this.pointerLockErrorHandler);
    this.domElement.addEventListener("contextmenu", this.contextMenuHandler);
  }

  private setupPointerLock(): void {
    // Request pointer lock when clicking on the canvas
    this.domElement.style.cursor = "crosshair";
  }

  private onClick(): void {
    if (!this.isPointerLocked) {
      this.domElement.requestPointerLock();
    }
  }

  private onPointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === this.domElement;

    if (this.isPointerLocked) {
      this.domElement.addEventListener("mousemove", this.mouseMoveHandler);
      console.log("Pointer locked - FPS controls active");
    } else {
      this.domElement.removeEventListener("mousemove", this.mouseMoveHandler);
      console.log("Pointer unlocked - FPS controls disabled");
    }
  }

  private onPointerLockError(): void {
    console.log("Pointer lock failed");
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keys[event.code] = true;

    // Prevent default for movement keys
    if (
      ["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ShiftLeft"].includes(
        event.code
      )
    ) {
      event.preventDefault();
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys[event.code] = false;
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isPointerLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    // Apply sensitivity scaling for smoother mouse movement
    const sensitivity = this.lookSpeed * 50; // Reduced scaling for much lower sensitivity

    // Update yaw (horizontal rotation)
    this.yaw -= movementX * sensitivity;

    // Update pitch (vertical rotation) with limits
    this.pitch -= movementY * sensitivity;
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

    // Apply rotations to camera
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  public update(): void {
    if (!this.isPointerLocked) return;

    // Calculate movement direction based on camera orientation
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);

    // Apply camera rotation to movement vectors
    forward.applyQuaternion(this.camera.quaternion);
    right.applyQuaternion(this.camera.quaternion);

    // Zero out Y component for horizontal movement only
    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();

    // Calculate acceleration based on input
    this.acceleration.set(0, 0, 0);

    if (this.keys["KeyW"]) {
      this.acceleration.add(forward);
    }
    if (this.keys["KeyS"]) {
      this.acceleration.sub(forward);
    }
    if (this.keys["KeyA"]) {
      this.acceleration.sub(right);
    }
    if (this.keys["KeyD"]) {
      this.acceleration.add(right);
    }

    // Vertical movement
    if (this.keys["Space"]) {
      this.acceleration.y += 1;
    }
    if (this.keys["ShiftLeft"]) {
      this.acceleration.y -= 1;
    }

    // Apply acceleration to velocity with smoother movement
    this.acceleration.multiplyScalar(this.moveSpeed);
    this.velocity.add(this.acceleration);

    // Limit maximum velocity for smoother movement
    const maxVelocity = 0.08;
    if (this.velocity.length() > maxVelocity) {
      this.velocity.normalize().multiplyScalar(maxVelocity);
    }

    // Apply friction
    this.velocity.multiplyScalar(this.friction);

    // Update camera position
    const newPosition = this.camera.position.clone().add(this.velocity);

    // Apply bounds checking
    newPosition.x = Math.max(
      this.bounds.minX,
      Math.min(this.bounds.maxX, newPosition.x)
    );
    newPosition.z = Math.max(
      this.bounds.minZ,
      Math.min(this.bounds.maxZ, newPosition.z)
    );
    newPosition.y = Math.max(
      this.bounds.minY,
      Math.min(this.bounds.maxY, newPosition.y)
    );

    this.camera.position.copy(newPosition);
  }

  public setBounds(bounds: Partial<typeof this.bounds>): void {
    this.bounds = { ...this.bounds, ...bounds };
  }

  public getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  public isMoving(): boolean {
    return this.velocity.length() > 0.01;
  }

  public dispose(): void {
    document.removeEventListener("keydown", this.keyDownHandler);
    document.removeEventListener("keyup", this.keyUpHandler);
    this.domElement.removeEventListener("click", this.clickHandler);
    document.removeEventListener("pointerlockchange", this.pointerLockChangeHandler);
    document.removeEventListener("pointerlockerror", this.pointerLockErrorHandler);
    this.domElement.removeEventListener("contextmenu", this.contextMenuHandler);
    this.domElement.removeEventListener("mousemove", this.mouseMoveHandler);

    if (this.isPointerLocked) {
      document.exitPointerLock();
    }
  }
}
