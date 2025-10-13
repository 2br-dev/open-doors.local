import Lazy, {ILazyLoadInstance, ILazyLoadOptions} from 'vanilla-lazyload';
import MouseParallax, { IParallaxOptions } from './lib/mousemove_parallax';
import * as M from 'materialize-css';

import Swiper from 'swiper';
import { Mousewheel,Scrollbar } from 'swiper';

Swiper.use([ Mousewheel, Scrollbar ]);

let source:any;
let map:any;
let zoom:any = 17;
let view:any;
let scrollTop = 0;
declare var ol:any;

Swiper.use([Mousewheel]);

(() => {

	setProgramLength();

	let date = new Date().getFullYear();
	document.getElementById('year').innerHTML = date.toString();

	let lazy = new Lazy({
		callback_loaded: ((el:HTMLElement, instance: ILazyLoadInstance) => {
			el.classList.add('complete');
		})
	}, document.querySelectorAll('.lazy'));

	let options:IParallaxOptions = {
		wrapper: '#hero',
		layers: '.level',
		depthAttribute: 'depth',
		sensitivity: 12
	}

	let parallax = new MouseParallax(options);
	
	window.addEventListener('resize', setProgramLength);

	if(document.querySelectorAll('#map').length){
		loadScript("https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.4.3/build/ol.js", () => {
			initMap();
		})
	}

	let sidenav = M.Sidenav.init(document.querySelectorAll('.sidenav'), {
		edge: 'right'
	});

	$('body').on('click', '.scroll-link', (e:JQuery.ClickEvent) => {

		e.preventDefault();
		let el = <HTMLLinkElement>e.currentTarget;
		let url = new URL(el.href);
		let anchor = url.hash;

		let sidenav = M.Sidenav.getInstance(<HTMLElement>document.querySelector('.sidenav'));
		sidenav.close();

		let target = <HTMLElement>document.querySelector(anchor);
		let top = target.offsetTop;

		if(anchor == "#main"){
			top = 0;
		}

		$('html, body').animate({
			scrollTop: top
		}, 400);
	})

	let stop = (e:Event) => {
		e.preventDefault();
	}

	let programSwiper = new Swiper('#program-swiper', {
		mousewheel: {
			sensitivity: 4
		},
		scrollbar: {
			el: '.program-scrollbar',
			draggable: true
		},
		breakpoints: {
			300: {
				slidesPerView: 1
			},
			700: {
				slidesPerView: 2
			},
			1400: {
				slidesPerView: 3
			}
		},
	})


})()

/** Устновка ширины контейнера программы дня */
function setProgramLength(){

	let el = <HTMLElement>document.querySelector('.program-scroll');
	let left = el.getBoundingClientRect().left;
	let parent = <HTMLElement>el.parentElement;

	let width = parent.clientWidth + left;
	el.style.width = width + "px";
}

/**
 * Инициализация карты
 */
function initMap(){

	
	let coords = [38.928472, 45.046795];

	let parkingCoords = [38.929998, 45.044280];

	let style = new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [.5, 1],
			src: "/od2024/img/map_marker.png"
		})
	});

	let parkingStyle = new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [.5, 1],
			src: "/od2024/img/parking_marker.png"
		})
	});

	let marker = new ol.Feature({
		type: 'icon',
		geometry: new ol.geom.Point(ol.proj.fromLonLat(coords))
	});

	let parkingMarker = new ol.Feature({
		type: 'icon',
		geometry: new ol.geom.Point(ol.proj.fromLonLat(parkingCoords))
	});

	marker.setStyle(style);
	parkingMarker.setStyle(parkingStyle);

	source = new ol.source.Vector({
		features: [ marker, parkingMarker ]
	});

	let vectorLayer = new ol.layer.Vector({
		source: source
	})

	view = new ol.View({
		center: ol.proj.fromLonLat(coords),
		zoom: zoom
	});

	map = new ol.Map({
		target: 'map',
		renderer: 'canvas',
		interactions: ol.interaction.defaults({mouseWheelZoom:false}),
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM({
					url: "https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
				})
			}),
			vectorLayer
		],

		view: view
	});

	map.behaviors.disable('scrollZoom');

	// Смещение центра карты
	correctCenter();

	window.addEventListener('resize', correctCenter);

	map.on('click', function(evt:any) {
        var f = map.forEachFeatureAtPixel(
            evt.pixel,
            function(ft:any, layer:any){return ft;}
        );
        if (f && f.get('type') == 'icon') {
            var linkEl = $('<a href="https://yandex.ru/maps/-/CDB~vV9G" target="_blank">YMaps</a>');
            $('#map').append(linkEl);
            linkEl[0].click();
            $(linkEl).remove();
        }        
    });

	map.on("pointermove", function (evt) {
        var hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return true;
        }); 
        if (hit) {
            this.getTargetElement().style.cursor = 'pointer';
        } else {
            this.getTargetElement().style.cursor = '';
        }
    });
}

/**
 * Корректировка центра карты 
 */ 
function correctCenter(){
	let contactsData = document.querySelector('#contacts-data');
	let rect = contactsData?.getBoundingClientRect();
	let offset = rect?.width;

	if(window.innerWidth <= 800 ){
		offset = 0
	}

	let feature = source.getFeatures()[0];
	let point = feature.getGeometry();

	view.fit(point, {padding: [0, 0, 0, offset], maxZoom: zoom});
}

/**
 * Подгрузка скрипта
 * @param {string} url Адрес скрипта
 * @param {void} callback Обработчик, запускаемый по окончании загрузки
 */
function loadScript(url:string, callback:()=>any){
	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	script.onload = callback;
	document.body.appendChild(script);

	if((script as any).readyState){ //IE
		(script as any).onreadystatechange = function(){
			if((script as any).readyState === "loaded" || (script as any).readyState === "complete"){
				(script as any).onreadystatechange = null;
				callback();
			}
		}
	}else{
		script.onload = callback;
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}