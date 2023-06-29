
export function initMetrica() {
	let cursor = $("#fake-cursor"),
		interval = 10,
		mouseX = 0, mouseY = 0,
		mouseCoords = [],
		isRecording = false,
		coordsIndex,
		clicks = [],
		recordTime,
		playingTime,
		mouseInterval,
		playingInterval,
		recordingStart,
		recordingDuration,
		currentClick = 0,
		timesGone = 0,
		scrolls = [],
		currentScrolls = 0;

	const startRecording = () => {
		recordTime = 0
		isRecording = true
		clicks = []
		mouseCoords = []
		scrolls = []
		recordingStart = Date.now()
		mouseInterval = setInterval(() => {
			mouseCoords.push({ left: mouseX, top: mouseY })
		}, interval)
	}

	const triggerScrolls = () => {
		setTimeout(() => {
			scrolls[currentScrolls].el.scrollTop(scrolls[currentScrolls].scrollTop)
			currentScrolls++
			if (currentScrolls < scrolls.length) {
				triggerScrolls()
			}
		},currentScrolls ? scrolls[currentScrolls].time - scrolls[currentScrolls - 1].time : scrolls[currentScrolls].time)
	}

	const triggerClicks = () => {
		setTimeout(() => {
			//doc.click()
			//doc.trigger('mouseup')
			clicks[currentClick].el.trigger('mousedown')
			clicks[currentClick].el.trigger('mouseup')
			clicks[currentClick].el.trigger('click')
			console.log('click')
			console.log(clicks[currentClick].el)
			currentClick++
			if (currentClick < clicks.length) {
				triggerClicks()
			}
		},currentClick ? clicks[currentClick].time - clicks[currentClick - 1].time : clicks[currentClick].time)
	}

	const stopRecording = () => {
		clearInterval(mouseInterval)
		if (isRecording) {
			recordingDuration = Date.now() - recordingStart
		}
		isRecording = false
		console.log(clicks)
		console.log(mouseCoords)
		console.log(recordingDuration);
	}

	const playRecord = () => {
		cursor.show();
		playingTime = 0
		coordsIndex = 0
		currentClick = 0
		timesGone = 0
		currentScrolls = 0
		playingInterval = setInterval(() => {
			cursor.offset(mouseCoords[coordsIndex])
			coordsIndex++
			playingTime += interval
			if (playingTime >= recordingDuration) {
				clearInterval(playingInterval)
				cursor.hide()
			}
		},interval)
		if (clicks.length) {
			triggerClicks()
		}
		if (scrolls.length) {
			triggerScrolls()
		}
	}

	const saveScrollEvents = () => {

	}

	return {
		delegateEvents: function () {

			let wrap = $("#eventProps")
			Object.keys(window).forEach(key => {
				if (/^on/.test(key)) {
					window.addEventListener(key.slice(2), event => {
						if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
							if (event.changedTouches.length) {
								let html = '';
								const touch = event.changedTouches.item(0);
								for (const key in touch) {
									html += `<p>${key}: ${touch[key]}</p>`
								}
								wrap.html(html)
							}
						}
					});
				}
			});

			$("#start-recoding").click(function () {
				startRecording()
			})

			$("#stop-recoding").click(function () {
				stopRecording()
				console.log(clicks);
				console.log(scrolls);
			})

			$("#screen-shot").click(function () {
				html2canvas(document.querySelector(".main__content")).then(canvas => {
					document.body.appendChild(canvas)
				});
			})

			$("#repeat-user-actions").click(function () {
				playRecord()
			})

			$(document).mousemove(function (e) {
				mouseX = e.pageX
				mouseY = e.pageY
			})

			$(document).mousedown(function (e) {
				if (isRecording) {
					if (e.target.tagName === 'circle' || e.target.tagName === 'svg' || e.target.tagName === 'path') {
						clicks.push({
							el:  $(e.target.closest('button')),
							time: Date.now() - recordingStart
						})
					} else {
						clicks.push({
							el: $(e.target),
							time: Date.now() - recordingStart
						})
					}
				}
			})

			$(window).scroll(function (e) {
				if (isRecording) {
					scrolls.push({
						el: $(this),
						scrollTop: window.pageYOffset,
						time: Date.now() - recordingStart
					})
				}
			})

			$("div").scroll(function (e) {
				if (isRecording) {
					let el = $(e.currentTarget)
					scrolls.push({
						el: el,
						scrollTop: el.scrollTop(),
						time: Date.now() - recordingStart
					})
				}
			})
		}
	}
}


$(document).ready(function () {
	console.log('init')
	initMetrica().delegateEvents();
})
