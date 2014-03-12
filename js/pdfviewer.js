var pdfViewer = (function(pdfViewer, $) {
	var popupPlugin = null; //для сохранения окружения плагина попапа
		elms = {}, //хранит кешированные элементы
		padd = 25, //паддинг сверху и снизу у попапа от края окна
		marg = 30,
		initFrom = 0, //по умолчанию какую страницу показывать первой
		visiblePreview = true, //флаг отображения превьюшек
		widthPreview = {width: 0, saved: 0}, //объект для работы с шириной бокса превью
		toggler = {}, //объект-переключатель видимости превью
		pageCount = 0,
		currentSelect = 0,
		viewTopIndent = 0,
		scrollDir = 'down',
		needAutoScroll = false, //флаг автопрокрутки блока превью в случае перехода к странице из поля ввода страницы, либо после поднятия плагина в случае не первой страницы
		utils = {}; //объект с вспомогательными функциями

	/*
	метод изменения ширины превью-ленты
	*/
	widthPreview.setWidth = function(newWidth) {
		this.width = newWidth;

		elms.$boxW.width(this.width);
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
		elms.$heightSeparator.add(elms.$boxPreviews).add(elms.$previewToolbar).toggleClass('hide');
		if (visiblePreview) {
			widthPreview.setWidth( widthPreview.saved );
			elms.$togglePreview.html('<');
			elms.$togglePreview.removeClass('hided');
		} else {
			widthPreview.setWidth(0);
			elms.$togglePreview.html('>');
			elms.$togglePreview.addClass('hided');
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

        self.inner();

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
				open: function() {

				},
				beforeOpen: function() {

					var from, src;
					popupPlugin = $.magnificPopup.instance;
					/*
					устанавливаем высоту плагина не более высоты окна
					*/
					elms.$boxes.css('height', elms.$win.height() - padd * 2 - marg);

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

                        pageCount = parseInt(data['page_count'], 10);
						elms.$countPage.html(pageCount);

						$.each( data['data_files'] , function( key, val ) {
							var srcPath = basePatch + '/' + val;
							strElems = strElems + '<li class="item" data-big_src="' + srcPath + '"><img src="' + basePatch + '/thumb/' + val + '"><span class="tb"></span><span class="bb"></span><span class="lb"></span><span class="rb"></span></li>';
						});
						elms.$list.html(strElems);
						elms.$listItems = elms.$list.find('.item');
						if (initFrom > 0) {
							needAutoScroll = true;
						}
						elms.$listItems.eq(initFrom).trigger('click');
					});
				}
			}
		});

	};

	pdfViewer.checkBtns = function(val) {
		elms.$img.css('visibility', 'hidden');
		elms.$btns.removeClass('disable');
		if (val <= 0) {
			elms.$btn_prev.addClass('disable');
		} else if (val >= elms.$listItems.length - 1) {
			elms.$btn_next.addClass('disable');
		}
	}

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
		elms.$togglePreview = $('#toggle_sidebar');
		elms.$list = $('#list_thumbnails');
		elms.$listItems = $();
		elms.$countBox = $('#count');
		elms.$countPage = $('#current_page_count');
		elms.$currentPage = $('#current_page');
		elms.$boxMainView = $('#main_view .inner');
		elms.$boxOuterMainView = $('#main_view .box');
		elms.$previewToolbar = $('#thumbnails .toolbar');
		elms.$boxW = $('#thumbnails .box_outer');
		elms.$img = $('#main_page');
		elms.$btns = elms.$view.find('.btns_p');
		elms.$btn_prev = $('#b_page_previous');
		elms.$btn_next = $('#b_page_next');

		/*
		если есть коллбэк - вызываем
		*/
		if (callback) {
			callback.apply();
		}

	};

    /*
    Добавление каркаса окна
     */
    pdfViewer.inner = function() {
        if(!$('#viewerWrapper').length){
	        var html_inner =
	        '<table id="viewerWrapper" class="mfp-hide"><tr>' +
	        			'<td id="thumbnails">' +
	        				'<div class="box_outer">' +
		        				'<div class="toolbar">' + 
		    						'<div class="count" id="count">' +
		    							'<input type="text" name="" id="current_page" class="current_page" value="1"> из <span id="current_page_count">*</span>' +
		    						'</div>' +
	    						'</div>' +
		        				'<div class="box">' +
		        					'<div id="width_separator"></div>' +
		        					'<div class="inner">' +
		        						'<ul id="list_thumbnails" class="list"></ul>' +
		        					'</div>' +
		        				'</div>' +
	        				'</div>' +
	        			'</td>' +
	        			'<td id="main_view">' +
	        				'<div class="box_outer">' +
		        				'<div id="height_separator"></div>' +
		        				'<div class="toolbar">' +
			        				'<div id="toggle_sidebar" class="toggle btns" title="скрыть"><</div>' +
			        				'<span id="b_page_previous" class="btns btns_p"><<</span>' +
		        					'<span id="b_page_next" class="btns btns_p">>></span>' +
			        			'</div>' +
		        				'<div class="box">' +
		        					'<div class="inner"><img src="" class="img" id="main_page"></div>' +
		        				'</div>' +
	        				'</div>' +
	        			'</td>' +
	            '</tr></table>';
	        $(html_inner).appendTo( 'body' );
        }
   };

    /*
    листание большой картинки
     */
    pdfViewer.paging  = function(dirIndent) {
        if (
                currentSelect + dirIndent < elms.$listItems.length &&
                currentSelect + dirIndent >= 0
            ) {
            var preview = elms.$listItems.eq(currentSelect + dirIndent);
            preview.click();
            elms.$boxPreviews.scrollTop(0);
            elms.$boxPreviews.scrollTop( preview.height() + preview.position().top + 20 - elms.$view.height() );
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
        листание большой картинки
         */
        elms.$view.on('click', '#b_page_previous', function() {
            pdfViewer.paging(-1)
        });
        elms.$view.on('click', '#b_page_next', function() {
            pdfViewer.paging(1)
        });

	    elms.$img.on('load', function() {
	    	elms.$img.css('visibility', 'visible');
			if (needAutoScroll) {
				elms.$boxPreviews.scrollTop(0);
				elms.$boxPreviews.scrollTop( elms.$listItems.eq(currentSelect).position().top - 30 );
				needAutoScroll = false;
			}
		});

		/*
		клик на превью - отображение большой фотки
		*/
		elms.$view.on('click', '#list_thumbnails .item', function() {
			var $this = $(this);

			currentSelect = $this.index();
			$this.siblings().removeClass('active');
			$this.addClass('active');
			elms.$currentPage.val(currentSelect + 1);
			pdfViewer.checkBtns(currentSelect);
			elms.$img.attr('src', $this.data('big_src'));
		});

		elms.$view.on('keypress', elms.$currentPage, function(event){
			if (
				event.which != 8 && 
				event.which != 0 && 
				event.which != 13 && 
				(event.which < 48 || event.which > 57 || (event.which === 48 && $.trim(elms.$currentPage.val()) == ''))
			) return false;

			if (event.which === 13) {
				if (utils.isNumber(elms.$currentPage.val())) {
					var page = parseInt(elms.$currentPage.val(), 10);
					if (page > 0 && page <= pageCount) {
						needAutoScroll = true;
						elms.$listItems.eq(page - 1).trigger('click');
					}
				}
			}
		});

		/*
		изменение ширины превью тасканием мышкой границы превью
		*/
		elms.$heightSeparator.on('mousedown', function() {
			elms.$win.on('mousemove', function(e) {
				var val = e.pageX - elms.$boxW.offset().left;
				if ( val >= pdfViewer.options.minWidthPreview && val < pdfViewer.options.maxWidthPreview ) {
					widthPreview.setWidth(val);
					widthPreview.saveWidth(val);
					elms.$boxOuterMainView.scrollTop( elms.$img.position().top );
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
    $('.link:first').click();//@todo for test //ant
});