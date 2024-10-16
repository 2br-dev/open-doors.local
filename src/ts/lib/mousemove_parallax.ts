/**
 * Опции параллакса
 * @member {string} wrapper Селектор оболочки параллакса
 * @member {string} layers Селектор слоёв
 * @member {string} depthAttribute Атрибут глубины (множитель)
 * @member {number} sensitivity Чувстсвительность
 */
export interface IParallaxOptions{
	/** Селектор оболочки параллакса */
	wrapper:string,
	/** Селектор слоёв */
	layers:string,
	/** Атрибут глубины (множитель) */
	depthAttribute:string
	/** Чувствительнось */
	sensitivity: number
}

/**
 * Параллакс-эффект по движению мыши
 */
export default class MouseParallax{

	wrappers: NodeListOf<HTMLElement>;
	layers:NodeListOf<HTMLElement>;

	constructor(options:IParallaxOptions){

		this.wrappers = <NodeListOf<HTMLElement>>document.querySelectorAll(options.wrapper);

		this.wrappers.forEach((wrapper:HTMLElement) => {

			wrapper.addEventListener("mouseenter", () => {

				let layers = <NodeListOf<HTMLElement>>wrapper.querySelectorAll(options.layers);
				layers.forEach((el:HTMLElement) => {
					el.style.transition = "none";
				})
			});

			wrapper.addEventListener("mouseleave", () => {

				let layers = <NodeListOf<HTMLElement>>wrapper.querySelectorAll(options.layers);
				layers.forEach((el:HTMLElement) => {
					el.style.transition = "transform .2s";
					setTimeout(() => {
						el.style.transform = "translate(0,0)";
					})
				})
			});
			
			wrapper.addEventListener('mousemove', (e:MouseEvent) => {
				
				this.layers = <NodeListOf<HTMLElement>>wrapper.querySelectorAll(options.layers);
				let mouseX = e.clientX - wrapper.offsetLeft;
				let mouseY = e.clientY - wrapper.offsetTop;
				
				let width = wrapper.clientWidth;
				let height = wrapper.clientHeight;
				
				let normalX = ( mouseX / width ) * 2 - 1;
				let normalY = (- ( mouseY / height ) * 2 + 1) * -1;
				
				this.layers.forEach((layer:HTMLElement) => {

					let depth = layer.dataset[options.depthAttribute] || "0"
					let multiplier = parseFloat(depth);
					let x = options.sensitivity * normalX * multiplier;
					let y = options.sensitivity * normalY * multiplier;
					let style = `translate(${x}px, ${y}px)`;

					layer.style.transform = style;
				})
			})
		})
	}
}