import Lazy, { ILazyLoadInstance, ILazyLoadOptions } from "vanilla-lazyload";
import MouseParallax, { IParallaxOptions } from "./lib/mousemove_parallax";
import * as M from "materialize-css";

import Swiper from "swiper";
import { Mousewheel, Scrollbar } from "swiper";

Swiper.use([Mousewheel, Scrollbar]);

let source: any;
declare var ymaps: any;
let map: any;
let zoom: any = 17;
let view: any;
let scrollTop = 0;
declare var ol: any;

Swiper.use([Mousewheel]);

(() => {
	setProgramLength();

	let date = new Date().getFullYear();
	const yearEl = document.getElementById("year");
	if(yearEl){
		yearEl.innerHTML = date.toString();
	}

	let lazy = new Lazy(
		{
			callback_loaded: (el: HTMLElement, instance: ILazyLoadInstance) => {
				el.classList.add("complete");
			},
		},
		document.querySelectorAll(".lazy"),
	);

	let options: IParallaxOptions = {
		wrapper: "#hero",
		layers: ".level",
		depthAttribute: "depth",
		sensitivity: 12,
	};

	let parallax = new MouseParallax(options);

	window.addEventListener("resize", setProgramLength);

	if (document.querySelectorAll("#map").length) {
		loadScript("https://api-maps.yandex.ru/2.1/?lang=ru_RU", () => {
			initMap();
		});
	}

	let sidenav = M.Sidenav.init(document.querySelectorAll(".sidenav"), {
		edge: "right",
	});

	$("body").on("click", ".scroll-link", (e: JQuery.ClickEvent) => {
		e.preventDefault();
		let el = <HTMLLinkElement>e.currentTarget;
		let url = new URL(el.href);
		let anchor = url.hash;

		let sidenav = M.Sidenav.getInstance(<HTMLElement>document.querySelector(".sidenav"));
		sidenav.close();

		let target = <HTMLElement>document.querySelector(anchor);
		let top = target.offsetTop;

		if (anchor == "#main") {
			top = 0;
		}

		$("html, body").animate(
			{
				scrollTop: top,
			},
			400,
		);
	});

	let stop = (e: Event) => {
		e.preventDefault();
	};

	let programSwiper = new Swiper("#program-swiper", {
		autoHeight: true,
		mousewheel: {
			sensitivity: 4,
		},
		scrollbar: {
			el: ".program-scrollbar",
			draggable: true,
		},
		breakpoints: {
			300: {
				slidesPerView: 1,
			},
			700: {
				slidesPerView: 2,
			},
			1400: {
				slidesPerView: 3,
			},
		},
	});
})();

/** Устновка ширины контейнера программы дня */
function setProgramLength() {
	let el = <HTMLElement>document.querySelector(".program-scroll");
	let left = el.getBoundingClientRect().left;
	let parent = <HTMLElement>el.parentElement;

	let width = parent.clientWidth + left;
	el.style.width = width + "px";
}

/**
 * Инициализация карты
 */
function initMap() {

	ymaps.ready(() => {
		map = new ymaps.Map("map", {
			center: [45.046795, 38.928472],
			zoom: 16,
		});

		const pixelCenter = map.getGlobalPixelCenter();

		let markers = [
			[45.046795, 38.928472],
			[45.04428, 38.929998],
		];

		let contactsData = document.querySelector("#contacts-data");
		let rect = contactsData?.getBoundingClientRect();
		let offset = rect?.width || 0;

		if (window.innerWidth <= 800) {
			offset = 0;
		}

		map.setGlobalPixelCenter([pixelCenter[0] - offset / 2, pixelCenter[1] + 0]);

		let markerArray = [];

		markers.forEach((coords, index) => {
			let marker = new ymaps.Placemark(coords, {}, {});

			if (index == 0) {
				marker.options.set("iconLayout", "default#image");
				marker.options.set("iconImageHref", "../dod2026/img/map_marker.png");
				marker.options.set("iconImageSize", [40, 40]);
				marker.options.set("iconImageOffset", [-20, -40]);
			}

			if (index == 1) {
				marker.options.set("iconLayout", "default#image");
				marker.options.set("iconImageHref", "../dod2026/img/parking_marker.png");
				marker.options.set("iconImageSize", [40, 40]);
				marker.options.set("iconImageOffset", [-20, -40]);
			}

			markerArray.push(marker);
			map.geoObjects.add(marker);
		});
	});
}

/**
 * Подгрузка скрипта
 * @param {string} url Адрес скрипта
 * @param {void} callback Обработчик, запускаемый по окончании загрузки
 */
function loadScript(url: string, callback: () => any) {
	let script = document.createElement("script");
	script.type = "text/javascript";
	script.src = url;
	script.onload = callback;
	document.body.appendChild(script);

	if ((script as any).readyState) {
		//IE
		(script as any).onreadystatechange = function () {
			if ((script as any).readyState === "loaded" || (script as any).readyState === "complete") {
				(script as any).onreadystatechange = null;
				callback();
			}
		};
	} else {
		script.onload = callback;
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}
