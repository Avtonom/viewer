var pdfViewer = (function(pdfViewer, $) {
	var popupPlugin = null; //для сохранения окружения плагина попапа
		elms = {}, //хранит кешированные элементы
		padd = 25, //паддинг сверху и снизу у попапа от края окна
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
		elms.$heightSeparator.add(elms.$boxPreviews).add(elms.$countBox).toggleClass('hide');
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

        self.inner();//ant

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
                    // elms.$list.css('height', elms_win_height);//ant
                    // elms.$boxes.find('.inner').css('height', elms_win_height);//ant

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

                        // elms.$list.empty();//ant

                        pageCount = parseInt(data['page_count'], 10);
						elms.$countPage.html(pageCount);

						$.each( data['data_files'] , function( key, val ) {
							var srcPath = basePatch + '/' + val;
							strElems = strElems + '<li class="item" data-big_src="' + srcPath + '"><img src="' + basePatch + '/thumb/' + val + '"><span class="tb"></span><span class="bb"></span><span class="lb"></span><span class="rb"></span></li>';
                            // $(strElems).appendTo( elms.$list );//ant
						});
						elms.$list.html(strElems);
						elms.$listItems = elms.$list.find('.item');
						elms.$listItems = elms.$list.find('.item');
						if (initFrom > 0) {
							needAutoScroll = true;
						}
						elms.$listItems.eq(initFrom).trigger('click');
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
		elms.$togglePreview = $('#toggle_sidebar');
		elms.$list = $('#list_thumbnails');
		elms.$listItems = $();
		elms.$images = $();
		elms.$countBox = $('#count');
		elms.$countPage = $('#current_page_count');
		elms.$currentPage = $('#current_page');
		elms.$boxMainView = $('#main_view .inner');
		elms.$boxOuterMainView = $('#main_view .box');

		/*
		если есть коллбэк - вызываем
		*/
		if (callback) {
			callback.apply();
		}

	};

    pdfViewer.inner = function() {
        if(!$('#viewerWrapper').length){
	        var html_inner =
	        '<table id="viewerWrapper" class="mfp-hide"><tr>' +
	        			'<td id="thumbnails">' +
	        				'<div class="box_outer">' +
    						'<div class="count" id="count">' +
    							'<input type="text" name="" id="current_page" class="current_page" value="1"> из <span id="current_page_count">*</span>' +
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
	        				'<div id="toggle_sidebar" class="toggle" title="скрыть"><</div>' +
	        				'<div class="box">' +
	        					'<div class="inner">' +
	        						'<div id="height_separator"></div>' +
	        						'<a href="#previous" id="b_page_previous"><<</a>' +
	        						'<a href="#next" id="b_page_next">>></a>' +
	        					'</div>' +
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
            preview = elms.$listItems.eq(currentSelect + dirIndent);
            preview.click();
            elms.$boxPreviews.scrollTop(0);
            elms.$boxPreviews.scrollTop( preview.height() + preview.position().top + 20 - elms.$view.height() );
        }
    };

	/*
	метод привязки к объектам событий пользователя
	*/
	pdfViewer.binding = function() {
		var preview,
			startIndex,
			dirIndent;

		/*
		клик на кнопке скрытия/открытия превьюшек
		*/
		elms.$togglePreview.on('click', toggler.run);

		/*
		подгрузка новых страниц в блок просмотра при его прокрутке
		*/
		elms.$boxOuterMainView.on('scroll', function() {
            return true;
			startIndex = elms.$images.index(elms.$img);
			viewTopIndent > elms.$boxOuterMainView.scrollTop() ? scrollDir = 'top' : scrollDir = 'down';
			scrollDir === 'down' ? dirIndent = 1 : dirIndent = -1;

			if (startIndex < elms.$images.length - 1 && elms.$images.eq(startIndex + 1 * dirIndent).position().top - elms.$boxOuterMainView.scrollTop() <= (elms.$win.height() - padd * 2) / 2) {
				elms.$listItems.eq(currentSelect).removeClass('active');
				currentSelect = currentSelect + 1 * dirIndent;
				preview = elms.$listItems.eq(currentSelect);
				preview.addClass('active');
				elms.$images.eq(startIndex).removeAttr('id');
				elms.$images.eq(startIndex + 1 * dirIndent).attr('id', 'main_page');
				elms.$img = elms.$images.eq(startIndex + 1 * dirIndent);
				elms.$currentPage.val(currentSelect + 1 * dirIndent);
				if (preview.height() + preview.position().top > elms.$view.height()) {
					elms.$boxPreviews.scrollTop(0);
					elms.$boxPreviews.scrollTop( preview.height() + preview.position().top + 20 - elms.$view.height() );
				}
			}
			// if (startIndex === 1 && currentSelect + 1 <= elms.$listItems.length - 1) {
			// 	elms.$images.eq(startIndex - 1).remove();
			// 	elms.$boxMainView.append('<img src="' + elms.$listItems.eq(currentSelect + 1).data('big_src') + '" class="img">');
			// }
			elms.$images = elms.$boxMainView.find('img');
			viewTopIndent = elms.$boxOuterMainView.scrollTop();
		});

        /*
        листание большой картинки
         */
        elms.$view.on('click', '#b_page_previous', function() {
            pdfViewer.paging(-1)
        });
        elms.$view.on('click', '#b_page_next', function() {
            pdfViewer.paging(1)
        });

		/*
		клик на превью - отображение большой фотки
		*/
		elms.$view.on('click', '#list_thumbnails .item', function() {
			var $this = $(this),
				strImgs = '<img src="" class="img" id="main_page">';

			currentSelect = $this.index();
			$this.siblings().removeClass('active');
			$this.addClass('active');
			elms.$currentPage.val(currentSelect + 1);

			elms.$boxMainView.find('img').remove();

            if(1){
                strImgs = '<img src="' + elms.$listItems.eq(currentSelect).data('big_src') + '" id="main_page" class="img">';
            } else {
                if (elms.$listItems.length === 1) {

                } else if (currentSelect === 0) {
                    strImgs += '<img src="' + elms.$listItems.eq(1).data('big_src') + '" class="img">';
                    if (elms.$listItems.length > 2) {
                        strImgs += '<img src="' + elms.$listItems.eq(2).data('big_src') + '" class="img">';
                    }
                } else if (currentSelect === elms.$listItems.length - 1) {
                    strImgs = '<img src="' + elms.$listItems.eq(currentSelect - 1).data('big_src') + '" class="img">' + strImgs;
                    if (currentSelect - 2 >= 0) {
                        strImgs = '<img src="' + elms.$listItems.eq(currentSelect - 2).data('big_src') + '" class="img">' + strImgs;
                    }
                } else {
                    strImgs = '<img src="' + elms.$listItems.eq(currentSelect - 1).data('big_src') + '" class="img">' + strImgs + '<img src="' + elms.$listItems.eq(currentSelect + 1).data('big_src') + '" class="img">';
                }
			}
			elms.$boxMainView.append(strImgs);
			elms.$img = $('#main_page');
			elms.$images = elms.$boxMainView.find('img');
			elms.$img.one('load', function() {
				if (needAutoScroll) {
					elms.$boxPreviews.scrollTop(0);
					elms.$boxPreviews.scrollTop( elms.$listItems.eq(currentSelect).position().top - 15 );
					needAutoScroll = false;
				}
				if (currentSelect !== 0) {
					elms.$boxOuterMainView.scrollTop( elms.$img.position().top );
				}
			});
			elms.$img.attr('src', $this.data('big_src'));

            // $this.find('img').load(function() {//ant
            //     elms.$list.scrollTop( $this.height() * $this.index());
            // });
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
				var val = e.pageX - elms.$widthSeparator.offset().left;
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