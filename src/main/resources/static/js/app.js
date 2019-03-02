$(function () {

	function getFilenameBase(fullFilename) {
		return Number.parseInt(fullFilename.split('.')[0])
	}

	function getFileExt(filename) {
		if (filename)
			return filename.split('.')[1]
	}

	function getFilesMap() {

		let result = {};

		$('.sortable').children().each(function (index) {
			let $currentElement = $(this);
			result[(index + 1)] = $currentElement.attr('id')
		});

		return result;
	}

	function getNumberByFilename(filename) {
		let filesMap = getFilesMap();
		return Object.keys(filesMap).find(key => filesMap[key] === filename);
	}

	function getFilenameByNumber(fileNumber) {
		return getFilesMap()[fileNumber]
	}

	function createImageContainer(file) {

		return $(`<div id="${file}"  class="img-container">	
					    <img id="${'img_' + file}" width="137" height="183" src="${'/file/download/' + file + "?" + Date.now()}"/>
					    <div class="img-container-overlay">
					        <a class="img-view" href="#" >Просмотр</a>
					        <a class="img-download" href="#">Скачать</a>
					        <a class="img-replace" href="#">Заменить</a>
					        <a class="img-remove" href="#">Удалить</a>
					    </div>		
						</div>`)

	}

	function getFilename(file) {
		let ext, filename;
		if (window.currentImageUrl && window.currentImageName) {
			ext = getFileExt(window.currentImageName);
			filename = getNumberByFilename(window.currentImageName)
		} else {
			ext = getFileExt(file.name);
			filename = Object.keys(getFilesMap()).length + 1;
		}


		return `${filename}.${ext}`;

	}

	function getFilenameFromUrl(url) {
		return url.split('/').reverse()[0];
	}

	function Reload() {
		$.ajax('/file/list')
			.then((files) => {
				Render(files)
			});

	}

	function Render(files) {
		$('.sortable').empty();
		files.forEach((file) => {

			let fileNum = getFilenameBase(file);

			if (fileNum == 1) {
				$('#retouch').append(createImageContainer(file))
			}
			if (fileNum > 1 && fileNum < 6) {
				$('#required').append(createImageContainer(file))
			}
			if (fileNum > 5) {
				$('#additional').append(createImageContainer(file))
			}
		});
		Subscribe();
	}

	function Download(fileUrl) {
		window.open(fileUrl);
	}

	function Delete(filename) {
		$.ajax({
			url: `/file/delete/${filename}`,
			type: 'DELETE',
			success: function (files) {
				Render(files)
			}

		});
	}

	function Upload(formData) {
		$.ajax({
			url: `/file/upload`,
			type: 'POST',
			data: formData,
			processData: false,  // tell jQuery not to process the data
			contentType: false,
			success: function (files) {
				Render(files)
			}

		})
	}

	function Subscribe() {

		$(".img-container")
			.hover(
				function (e) {
					e.preventDefault();
					if (!window.selectMode)
						$(this).find('.img-container-overlay').css('display', 'flex');

				}, function () {
					$(this).find('.img-container-overlay').hide();
				})
			.click(function (e) {
				if (window.selectMode) {
					let url = $(e.target).attr('src');

					let filename = getFilenameFromUrl(url);

					if (window.selectedFiles.has(filename)) {
						window.selectedFiles.delete(filename);
						$(e.target).fadeTo(100, 1)
					} else {
						window.selectedFiles.add(filename);
						$(e.target).fadeTo(100, 0.3)
					}
					if (window.selectedFiles.size > 0) {
						$('.select-img-action').show()
					} else {
						$('.select-img-action').hide()
					}

				}

			});

		$(".img-view").click(e => {
			e.preventDefault();

			$('#dialog_img').attr('src', $($(e.target).parent().parent()).find('img').attr('src'));
			$("#dialog").dialog("open");
		});

		$(".img-download").click(e => {
			e.preventDefault();
			Download($($(e.target).parent().parent()).find('img').attr('src'))
		});

		$(".img-replace").click(e => {
			e.preventDefault();

			let imgUrl = $($(e.target).parent().parent()).find('img').attr('src').split('?')[0];

			let fileName = getFilenameFromUrl(imgUrl);

			window.currentImageUrl = imgUrl;
			window.currentImageName = fileName;

			$('#file_upload').trigger('click');

		});

		$(".img-remove").click(e => {
			e.preventDefault();
			let imgUrl = $($(e.target).parent().parent()).find('img').attr('src');

			Delete(imgUrl.split('/').reverse()[0]);
		});

	}

	function Start() {

		window.currentImageUrl = null;
		window.currentImageName = null;
		window.selectMode = false;
		window.selectedFiles = new Set();

		$("#retouch")
			.sortable({
				receive: function (event, element) {

					let item = $(element.item);
					let sender = $(element.sender);

					sender.append(item.siblings('.img-container'));

				}
			})
			.disableSelection();

		$("#required, #additional")
			.sortable({
				connectWith: ".sortable",
			})
			.disableSelection();

		$('#file_upload').change(function (e) {
			e.preventDefault();

			let formData = new FormData();

			let files = e.target.files;

			let selectedFiles = Array.from(window.selectedFiles);

			if (window.selectMode) {
				if (selectedFiles.length === files.length) {
					for (let i = 0; i < files.length; i++) {
						let selectedFilename = selectedFiles[i];

						let file = files[i];

						let filename = `${getFilenameBase(selectedFilename)}.${getFileExt(selectedFilename)}`;

						formData.append('file', new File([file], filename, {type: file.type}));

					}
					Upload(formData);
				} else {
					alert(`Выберите файла: ${selectedFiles.length}`)
				}
			} else {
				const selectedFile = files[0];

				let filename = getFilename(selectedFile);

				let file = new File([selectedFile], filename, {type: selectedFile.type});

				formData.append('file', file);

				Upload(formData);
			}


			window.currentImageUrl = null;
			window.currentImageName = null;
			$('#file_upload')
				.val(null)
				.attr('multiple', false)

		});

		$("#dialog").dialog({
			modal: true,
			autoOpen: false,
			draggable: false,
			height: 'auto',
			width: 'auto',
			position: {
				my: "top",
				at: "top",
				of: $('#container'),

			}
		});

		$('#save').click((e) => {
			e.preventDefault();
			let map = getFilesMap();
			$.ajax({
				type: 'POST',
				url: `/file/sort`,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(map),
				success: function (files) {
					Render(files)
				}

			})

		});

		$('#selectImg').click(function (e) {
			e.preventDefault();
			if (window.selectMode) {
				$(this).text('Выбрать фото');
				$('#save').show();
				window.selectMode = false;

				$("img").fadeTo(100, 1);

				$('.select-img-action').hide();

				window.selectedFiles = new Set()
			} else {
				$(this).text('Отменить');
				$('#save').hide();
				window.selectMode = true;

			}

		});

		$('#select-img-action-download').click(function (e) {
			e.preventDefault();

			for (let file of window.selectedFiles) {
				Download('/file/download/' + file)
			}

		});

		$('#select-img-action-replace').click(function (e) {
			e.preventDefault();

			$('#file_upload')
				.attr('multiple', true)
				.trigger('click');
		});

		$('#select-img-action-delete').click(function (e) {
			e.preventDefault();

			let selectedFiles = Array.from(window.selectedFiles);

			selectedFiles.forEach((el) => {
				Delete(el)
			})

		});

		Subscribe();
	}

	Start();


});

