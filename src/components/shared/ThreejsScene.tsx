// import { Canvas, useLoader } from "@react-three/fiber";
import React, { MouseEvent, MouseEventHandler, type RefObject } from "react";
import * as ThreeJs from "three";
import * as datGui from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// @ts-ignore
// import modelSrc from "../../assets/models/scene.gltf";

interface IPlaneSize {
	width: number;
	height: number;
	widthSegment: number;
	heightSegment: number;
}

interface IComponentState {
	plane: IPlaneSize;
}

interface IComponentProps {}

interface IMouseHandlerComponent {
	onMousePress: (event: MouseEvent) => void;
	onMouseRelease: (event?: MouseEvent) => void;
	onMouseDrag: (event: MouseEvent) => void;
}

class ThreeJsScene
	extends React.Component<IComponentProps, IComponentState>
	implements IMouseHandlerComponent
{
	private rfSceneContainer: RefObject<HTMLDivElement>;
	private boxMesh!: ThreeJs.Mesh;
	private planeMesh!: ThreeJs.Mesh;
	private renderer!: ThreeJs.WebGLRenderer;
	private scene!: ThreeJs.Scene;
	private camera!: ThreeJs.PerspectiveCamera;
	private bIsMousePress: boolean;
	private prevMousePosition!: MouseEvent;
	private orbitControl!: OrbitControls;
	private frameRequestId!: number;

	public state: IComponentState;

	onMousePress = (event: MouseEvent) => {
		this.bIsMousePress = true;
		this.prevMousePosition = event;
	};

	onMouseRelease = () => {
		this.bIsMousePress = false;
	};

	onMouseDrag = (event: MouseEvent) => {
		if (!this.bIsMousePress) {
			return;
		}

		const { clientX: prevX, clientY: prevY } = this.prevMousePosition;
		const { clientX: currentX, clientY: currentY } = event;
		const horizontalMove = currentX - prevX,
			verticalMove = currentY - prevY;

		// this.boxMesh.rotateY((horizontalMove / window.innerWidth) * 2 * Math.PI);
		// this.boxMesh.rotateX((verticalMove / window.innerHeight) * 2 * Math.PI);

		this.planeMesh.rotateY((horizontalMove / window.innerWidth) * 2 * Math.PI);
		this.planeMesh.rotateX((verticalMove / window.innerHeight) * 2 * Math.PI);

		this.prevMousePosition = event;

		this.renderer.render(this.scene, this.camera);
	};

	onPlaneMeshSizeChange = (prop: string, value: number) => {
		const { plane } = this.state;
		this.setState({ plane: { ...plane, [prop]: value } });
	};

	setupScene = () => {
		this.scene = new ThreeJs.Scene();
		this.camera = new ThreeJs.PerspectiveCamera(
			100,
			window.innerWidth / window.innerHeight,
			0.5,
			1000,
		);
		this.camera.position.z = 50;

		this.orbitControl = new OrbitControls(
			this.camera,
			this.rfSceneContainer.current as HTMLDivElement,
		);
		// this.orbitControl.maxZoom = 5;
		this.orbitControl.minDistance = 5;

		this.renderer = new ThreeJs.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(window.innerWidth / window.innerHeight);

		(this.rfSceneContainer.current as HTMLDivElement).appendChild(this.renderer.domElement);
	};

	addSceneObject = () => {
		/* 	// Create cube on screen
		const boxGeometryObj = new ThreeJs.BoxGeometry(10, 10, 10).toNonIndexed();
		const boxMaterial = new ThreeJs.MeshBasicMaterial({
			vertexColors: true,
		});

		const positionAttribute = boxGeometryObj.getAttribute("position");

		const colors = [];
		const color = new ThreeJs.Color();

		for (let i = 0; i < positionAttribute.count; i += 3) {
			color.set(Math.random() * 0xffffff);

			// define the same color for each vertex of a triangle
			colors.push(color.r, color.g, color.b);
			colors.push(color.r, color.g, color.b);
			colors.push(color.r, color.g, color.b);
		}

		// define the new attribute
		boxGeometryObj.setAttribute("color", new ThreeJs.Float32BufferAttribute(colors, 3));

		this.boxMesh = new ThreeJs.Mesh(boxGeometryObj, boxMaterial);

		this.scene.add(this.boxMesh); */

		const { plane: planeSize } = this.state;
		const planeGeometry = new ThreeJs.PlaneGeometry(
			planeSize.width,
			planeSize.height,
			planeSize.widthSegment,
			planeSize.heightSegment,
		);
		const planeMaterial = new ThreeJs.MeshPhongMaterial({
			color: 0x159467,
			side: ThreeJs.DoubleSide,
			flatShading: true,
		});
		this.planeMesh = new ThreeJs.Mesh(planeGeometry, planeMaterial);
		// const { array: meshVertexs } = this.planeMesh.geometry.attributes.position;

		// for (let i = 0; i < meshVertexs.length; i += 3) {
		// 	const z = meshVertexs[i + 2];
		// 	// @ts-ignore
		// 	meshVertexs[i + 2] = z + (Math.random() - 0.5) * 10;
		// }

		this.scene.add(this.planeMesh);

		const light = new ThreeJs.DirectionalLight(0xffffff, 1);
		light.position.set(0, 0, 5);
		this.scene.add(light);
	};

	setupDatGui = () => {
		const { plane: planeSize } = this.state;

		const world = {
			plane: {
				width: planeSize.width,
				height: planeSize.height,
				widthSegment: planeSize.widthSegment,
				heightSegment: planeSize.heightSegment,
			},
		};
		const gui = new datGui.GUI();
		gui.add(world.plane, "width", 1, 100).onChange((width) => {
			this.onPlaneMeshSizeChange("width", width);
		});
		gui.add(world.plane, "height", 1, 100).onChange((height) => {
			this.onPlaneMeshSizeChange("height", height);
		});
		gui.add(world.plane, "widthSegment", 1, 100).onChange((widthSegment) => {
			this.onPlaneMeshSizeChange("widthSegment", widthSegment);
		});
		gui.add(world.plane, "heightSegment", 1, 100).onChange((heightSegment) => {
			this.onPlaneMeshSizeChange("heightSegment", heightSegment);
		});
	};

	renderScene = () => {
		this.renderer.render(this.scene, this.camera);
	};

	startAnimationLoop = () => {
		this.frameRequestId = window.requestAnimationFrame(this.startAnimationLoop);
		this.renderScene();
	};

	constructor(props: IComponentProps) {
		super(props);
		this.bIsMousePress = false;

		this.state = {
			plane: {
				width: 42,
				height: 55,
				heightSegment: 10,
				widthSegment: 5,
			},
		};

		this.rfSceneContainer = React.createRef<HTMLDivElement>();
	}

	componentDidMount(): void {
		this.setupScene();
		this.setupDatGui();
		this.addSceneObject();
		this.renderScene();
		this.startAnimationLoop();
	}

	render(): React.ReactNode {
		return <div ref={this.rfSceneContainer} className="window-size"></div>;
	}

	componentDidUpdate(
		prevProps: Readonly<IComponentProps>,
		prevState: Readonly<IComponentState>,
		snapshot?: any,
	): void {
		this.planeMesh.geometry.dispose();

		const { plane: planeSize } = this.state;
		const planeGeometry = new ThreeJs.PlaneGeometry(
			planeSize.width,
			planeSize.height,
			planeSize.widthSegment,
			planeSize.heightSegment,
		);

		this.planeMesh.geometry = planeGeometry;
		// const { array: meshVertexs } = this.planeMesh.geometry.attributes.position;

		// for (let i = 0; i < meshVertexs.length; i += 3) {
		// 	const z = meshVertexs[i + 2];
		// 	// @ts-ignore
		// 	meshVertexs[i + 2] = z + (Math.random() - 0.5) * 10;
		// }

		this.renderer.render(this.scene, this.camera);
	}

	componentWillUnmount(): void {
		window.cancelAnimationFrame(this.frameRequestId);
		this.orbitControl.dispose();
	}
}

export default ThreeJsScene;
