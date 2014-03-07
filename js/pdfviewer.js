var pdfViewer = (function(pdfViewer, $) {
	var popupPlugin = null; //для сохранения окружения плагина попапа
		elms = {}, //хранит кешированные элементы
		padd = 10, //паддинг сверху и снизу у попапа от края окна
		initFrom = 0, //по умолчанию какую страницу показывать первой
		visiblePreview = true, //флаг отображения превьюшек
		widthPreview = {width: 0, saved: 0}, //объект для работы с шириной бокса превью
		toggler = {}, //объект-переключатель видимости превью
		utils = {}; //объект с вспомогательными функциями

	/*
	метод изменения ширины превью-ленты
	*/
	widthPreview.setWidth = function(newWidth) {
		this.width = newWidth;

		elms.$widthSeparator.width(this.width);
	}
	/*
	метод сохранения ширины превью - нужен для восстанвления ширины превью после 
	того как было скрытие, а затем открытие
	*/
	widthPreview.saveWidth = function(width) {
		this.saved = width;
	}

	/*
	метод сокрытия/открытия превьюшек
	*/
	toggler.run = function() {

		visiblePreview = !visiblePreview;
		elms.$heightSeparator.add(elms.$boxPreviews).toggleClass('hide');
		if (visiblePreview) {
			widthPreview.setWidth( widthPreview.saved );
			elms.$togglePreview.html('<');
		} else {
			widthPreview.setWidth(0);
			elms.$togglePreview.html('>');
		}

	}

	/*
	метод проверки на число
	*/
	utils.isNumber = function(val) {
		return !isNaN(parseFloat(val)) && isFinite(val);
	};



	/*
	метод инициализирует первоначальное состояние
	*/
	pdfViewer.init = function(opts) {

		var self = this;
		self.options = opts || {};

		/*
		кешируем элементы а затем навешиваем обработчики событий
		*/
		self.cashe(self.binding);

		/*
		производим первоначальную настройку ширины превьюшек исходя из параметров плагина
		*/
		widthPreview.setWidth( self.options.widthPreview );
		widthPreview.saveWidth( self.options.widthPreview );

		/*
		устанавливаем ширину плагина по переданным параметрам
		*/
		elms.$view.css('width', self.options.width);

		/*
		инициализируем плагин поднятия попап
		*/
		$('.' + self.options.className).magnificPopup({
			type: 'inline',
			callbacks: {
				beforeOpen: function() {
					var from, src;
					popupPlugin = $.magnificPopup.instance;
					/*
					устанавливаем высоту плагина не более высоты окна
					*/
					elms.$boxes.css('height', elms.$win.height() - padd * 2);

					/*
					вычисляем с какой страницы осуществить показ
					*/
					from = popupPlugin.st.el.data('init_from');
					src = popupPlugin.st.el.data('src');
					if ( typeof from != 'undefined' && utils.isNumber(from) && from !== 0 ) {
						initFrom = parseInt(from, 10) - 1;
					}

					/*
					загрузка данных для плагина
					*/
					$.getJSON( src, function( data ) {
						var basePatch = data['base_patch'],
							strElems = '';

						elms.$countPage.html(data['page_count']);

						$.each( data['data_files'] , function( key, val ) {
							var srcPath = basePatch + '/' + val;
							strElems = strElems + '<li class="item" data-big_src="' + srcPath + '"><img src="' + basePatch + '/thumb/' + val + '"><span class="tb"></span><span class="bb"></span><span class="lb"></span><span class="rb"></span></li>';
						});
						elms.$list.html(strElems);
						elms.$list.find('.item').eq(initFrom).trigger('click');
						// elms.$list.find('img').lazy();
					});
				}
			}
		});

	};

	/*
	метод кеширования элементов
	*/
	pdfViewer.cashe = function(callback) {

		elms.$win = $(window);
		elms.$view = $('#viewerWrapper');
		elms.$widthSeparator = $('#width_separator');
		elms.$heightSeparator = $('#height_separator');
		elms.$boxes = $('.box');
		elms.$boxPreviews = $('#thumbnails .box');
		elms.$img = $('.img');
		elms.$togglePreview = $('#toggle_sidebar');
		elms.$list = $('#list_thumbnails');
		elms.$countPage = $('#current_page_count');
		elms.$currentPage = $('#current_page');

		/*
		если есть коллбэк - вызываем
		*/
		if (callback) {
			callback.apply();
		}

	};

	/*
	метод привязки к объектам событий пользователя
	*/
	pdfViewer.binding = function() {

		/*
		клик на кнопке скрытия/открытия превьюшек
		*/
		elms.$togglePreview.on('click', toggler.run);

		/*
		клик на превью - отображение большой фотки
		*/
		elms.$view.on('click', '#list_thumbnails .item', function() {
			var $this = $(this);
			$this.siblings().removeClass('active');
			$this.addClass('active');
			elms.$currentPage.html($this.index() + 1);
			elms.$img.attr('src', $this.data('big_src'));
		});

		/*
		изменение ширины превью тасканием мышкой границы превью
		*/
		elms.$heightSeparator.on('mousedown', function() {
			elms.$win.on('mousemove', function(e) {
				var val = e.pageX - elms.$widthSeparator.offset().left;
				if ( val >= pdfViewer.options.minWidthPreview && val < pdfViewer.options.maxWidthPreview ) {
					widthPreview.setWidth(val);
					widthPreview.saveWidth(val);
				}
			});
			elms.$win.one('mouseup', function() {
				elms.$win.off('mousemove');
			});
		});

	};

	return pdfViewer;
}(pdfViewer || {}, jQuery));




$(function (){
	pdfViewer.init({
		className: 'link', //какой класс будет являться поднимающей плагин ссылкой
		width: 1000, //ширина плагина
		widthPreview: 170, //ширина страниц превью по дефолту
		minWidthPreview: 140, //минимальная ширина страниц превью
		maxWidthPreview: 300 //максимальная ширина страниц превью
	})
//    $('.link').click();//@todo for test
});